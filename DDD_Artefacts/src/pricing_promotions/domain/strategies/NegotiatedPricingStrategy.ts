import { Money } from '@shared/domain/value-objects/Money';
import { Result, success, failure } from '@shared/core/Result';
import { PricingStrategy, PricingContext } from './PricingStrategy';
import { MarkupPercentage } from '../value-objects/MarkupPercentage';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

/**
 * Customer-specific negotiated price configuration
 */
export interface NegotiatedPriceConfig {
  customerId: string;
  productId: string;
  negotiatedPrice?: number; // Direct negotiated price
  negotiatedMarkupPercentage?: number; // Or negotiated markup percentage
  validFrom: Date;
  validUntil?: Date;
}

/**
 * Extended context for negotiated pricing strategy
 */
interface NegotiatedPricingContext extends PricingContext {
  customerId: string;
  productId: string;
  negotiatedPrices?: NegotiatedPriceConfig[];
  currentDate?: Date;
}

/**
 * Negotiated pricing strategy for wholesale and special customer arrangements
 * Used primarily for Wholesale Supply in the business model
 */
export class NegotiatedPricingStrategy extends PricingStrategy {
  private negotiatedPrices: Map<string, NegotiatedPriceConfig[]>;

  constructor() {
    super(
      'Negotiated Pricing Strategy',
      'Applies customer-specific negotiated prices or markups'
    );

    this.negotiatedPrices = new Map<string, NegotiatedPriceConfig[]>();
  }

  /**
   * Calculate price based on negotiated agreements
   * @param context Pricing context with negotiated pricing specific fields
   * @returns The calculated selling price or an error
   */
  calculatePrice(context: NegotiatedPricingContext): Result<Money, string> {
    const { 
      baseCost, 
      quantity, 
      pricingTier, 
      customerId, 
      productId, 
      negotiatedPrices,
      currentDate = new Date()
    } = context;

    // If negotiated prices are provided in context, use them
    let pricesToSearch: NegotiatedPriceConfig[] | undefined;
    if (negotiatedPrices) {
      pricesToSearch = negotiatedPrices;
    } else {
      // Otherwise, look up from internal store based on customer ID
      pricesToSearch = this.negotiatedPrices.get(customerId);
    }

    // Find applicable negotiated price
    const negotiatedConfig = pricesToSearch?.find(config => {
      return config.productId === productId && 
             config.validFrom <= currentDate && 
             (!config.validUntil || config.validUntil >= currentDate);
    });

    let unitPrice: Money;

    if (negotiatedConfig) {
      // If a direct negotiated price is available, use it
      if (negotiatedConfig.negotiatedPrice !== undefined) {
        const priceResult = Money.create(negotiatedConfig.negotiatedPrice, baseCost.currency);
        if (priceResult.isFailure()) {
          return failure(`Failed to create money object for negotiated price: ${priceResult.error}`);
        }
        unitPrice = priceResult.getValue();
      } 
      // Otherwise use negotiated markup if available
      else if (negotiatedConfig.negotiatedMarkupPercentage !== undefined) {
        const markupResult = MarkupPercentage.create(negotiatedConfig.negotiatedMarkupPercentage);
        if (markupResult.isFailure()) {
          return failure(`Invalid negotiated markup: ${markupResult.error}`);
        }
        
        const markup = markupResult.getValue();
        const calculatedPrice = markup.applyToAmount(baseCost.amount);
        
        const priceResult = Money.create(calculatedPrice, baseCost.currency);
        if (priceResult.isFailure()) {
          return failure(`Failed to create money object for calculated price: ${priceResult.error}`);
        }
        
        unitPrice = priceResult.getValue();
      } 
      // If neither direct price nor markup is specified, fall back to tier's default markup
      else {
        return failure('Negotiated price config must specify either negotiatedPrice or negotiatedMarkupPercentage');
      }
    } 
    // No negotiated price found, fall back to tier's default markup
    else {
      const tierMarkup = pricingTier.getBaseMarkupPercentage();
      const markupResult = MarkupPercentage.create(tierMarkup);
      if (markupResult.isFailure()) {
        return failure(`Invalid markup from pricing tier: ${markupResult.error}`);
      }
      
      const markup = markupResult.getValue();
      const calculatedPrice = markup.applyToAmount(baseCost.amount);
      
      const priceResult = Money.create(calculatedPrice, baseCost.currency);
      if (priceResult.isFailure()) {
        return failure(`Failed to create money object for calculated price: ${priceResult.error}`);
      }
      
      unitPrice = priceResult.getValue();
    }

    // Calculate total price for the quantity
    const totalPriceResult = unitPrice.multiply(quantity);
    if (totalPriceResult.isFailure()) {
      return failure(`Failed to calculate total price: ${totalPriceResult.error}`);
    }
    const totalPrice = totalPriceResult.getValue();

    // Verify the calculated price meets margin floor requirements
    const totalBaseCost = baseCost.multiply(quantity).getValue();
    if (!this.verifyMarginFloor(totalPrice, totalBaseCost, pricingTier)) {
      return failure(`Calculated price violates margin floor requirements for tier ${pricingTier.toString()}`);
    }

    return success(totalPrice);
  }

  /**
   * Add or update a negotiated price configuration
   * @param config The negotiated price configuration to add or update
   */
  addNegotiatedPrice(config: NegotiatedPriceConfig): void {
    if (!config.customerId || !config.productId) {
      throw new Error('Customer ID and product ID are required');
    }

    if (config.validUntil && config.validFrom > config.validUntil) {
      throw new Error('Valid from date must be before or equal to valid until date');
    }

    if (config.negotiatedPrice === undefined && config.negotiatedMarkupPercentage === undefined) {
      throw new Error('Either negotiated price or markup percentage must be specified');
    }

    // Get existing configs for this customer or create a new array
    const existingConfigs = this.negotiatedPrices.get(config.customerId) || [];
    
    // Find and remove any existing config for the same product
    const filteredConfigs = existingConfigs.filter(c => c.productId !== config.productId);
    
    // Add the new config
    filteredConfigs.push(config);
    
    // Update the map
    this.negotiatedPrices.set(config.customerId, filteredConfigs);
  }

  /**
   * Remove a negotiated price configuration
   * @param customerId The customer ID
   * @param productId The product ID
   * @returns True if a configuration was removed, false otherwise
   */
  removeNegotiatedPrice(customerId: string, productId: string): boolean {
    const existingConfigs = this.negotiatedPrices.get(customerId);
    if (!existingConfigs) {
      return false;
    }

    const initialLength = existingConfigs.length;
    const filteredConfigs = existingConfigs.filter(c => c.productId !== productId);
    
    if (filteredConfigs.length < initialLength) {
      this.negotiatedPrices.set(customerId, filteredConfigs);
      return true;
    }
    
    return false;
  }

  /**
   * Get all negotiated prices for a customer
   * @param customerId The customer ID
   * @returns Array of negotiated price configurations or undefined if none exist
   */
  getNegotiatedPricesForCustomer(customerId: string): NegotiatedPriceConfig[] | undefined {
    return this.negotiatedPrices.get(customerId);
  }
}
