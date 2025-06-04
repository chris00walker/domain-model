import { Result, success, failure } from '@shared/core/Result';
import { Money } from '@shared/domain/value-objects/Money';
import { PricingStrategy, PricingContext } from '../strategies/PricingStrategy';
import { PricingTier } from '../value-objects/PricingTier';
import { PriceModifier } from '../value-objects/PriceModifier';
import { PriceChanged } from '../events/PriceChanged';
import { MarginFloorBreached } from '../events/MarginFloorBreached';
import { IDomainEventPublisher } from '@shared/domain/events/IDomainEventPublisher';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

/**
 * Service for calculating prices using the appropriate pricing strategy
 */
export class PriceCalculationService {
  private strategies: Map<string, PricingStrategy>;
  private eventPublisher?: IDomainEventPublisher;

  constructor(eventPublisher?: IDomainEventPublisher) {
    this.strategies = new Map<string, PricingStrategy>();
    this.eventPublisher = eventPublisher;
  }

  /**
   * Register a pricing strategy with the service
   * @param id Unique identifier for the strategy
   * @param strategy The pricing strategy implementation
   */
  public registerStrategy(id: string, strategy: PricingStrategy): void {
    this.strategies.set(id, strategy);
  }

  /**
   * Get a registered pricing strategy by ID
   * @param id The strategy identifier
   * @returns The pricing strategy or undefined if not found
   */
  public getStrategy(id: string): PricingStrategy | undefined {
    return this.strategies.get(id);
  }

  /**
   * Calculate the price using a specific pricing strategy
   * @param strategyId ID of the pricing strategy to use
   * @param context The pricing context containing necessary information
   * @param productId Optional product ID for event publishing
   * @param oldPrice Optional old price for event publishing
   * @returns The calculated price or an error
   */
  public calculatePrice(
    strategyId: string, 
    context: PricingContext,
    productId?: string,
    oldPrice?: number
  ): Result<Money, string> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      return failure(`Pricing strategy with ID '${strategyId}' not found`);
    }

    const calculationId = new UniqueEntityID().toString();
    const result = strategy.calculatePrice(context);

    if (result.isSuccess()) {
      // If we have a product ID and old price, publish a price changed event
      if (this.eventPublisher && productId && oldPrice !== undefined) {
        const newPrice = result.value;
        
        // Only publish if the price actually changed
        if (Math.abs(newPrice.amount - oldPrice) > 0.001) {
          const priceChangedEvent = new PriceChanged(
            productId,
            oldPrice,
            newPrice.amount,
            newPrice.currency,
            `Calculated using ${strategy.getName()} strategy`,
            calculationId
          );
          
          this.eventPublisher.publish(priceChangedEvent);
        }
      }
      
      return result;
    } else {
      // Check if this is a margin floor violation
      if (result.error.includes('margin floor') && this.eventPublisher && productId) {
        // Extract information from the error message
        const errorParts = result.error.match(/Calculated price violates margin floor requirements for tier (.*)/);
        const tierType = errorParts ? errorParts[1] : 'UNKNOWN';
        
        // Calculate the actual margin (approximate from the error message)
        const margin = 0; // This would need to be calculated or passed in
        const floorMargin = context.pricingTier.getFloorGrossMarginPercentage();
        
        // Publish margin floor breach event
        const marginBreachEvent = new MarginFloorBreached(
          productId,
          0, // Would need actual price
          context.baseCost.amount,
          context.baseCost.currency,
          margin,
          floorMargin,
          tierType,
          calculationId
        );
        
        this.eventPublisher.publish(marginBreachEvent);
      }
      
      return result;
    }
  }

  /**
   * Apply price modifiers to a base price
   * @param basePrice The base price to modify
   * @param modifiers Array of price modifiers to apply
   * @returns The modified price or an error
   */
  public applyPriceModifiers(
    basePrice: Money,
    modifiers: PriceModifier[]
  ): Result<Money, string> {
    if (!modifiers || modifiers.length === 0) {
      return success(basePrice);
    }

    // Sort modifiers by priority (higher priority applied first)
    const sortedModifiers = [...modifiers].sort((a, b) => b.priority - a.priority);
    
    let currentPrice = basePrice;
    
    for (const modifier of sortedModifiers) {
      const modifiedPriceResult = modifier.applyToPrice(currentPrice);
      if (modifiedPriceResult.isFailure()) {
        return failure(`Failed to apply price modifier (${modifier.name}): ${modifiedPriceResult.error}`);
      }
      currentPrice = modifiedPriceResult.value;
    }
    
    return success(currentPrice);
  }

  /**
   * Determine the appropriate pricing strategy for a given context
   * @param context The pricing context
   * @param defaultStrategyId The default strategy ID to use if no better match is found
   * @returns The ID of the most appropriate pricing strategy
   */
  public determineAppropriatePricingStrategy(
    context: Record<string, any>,
    defaultStrategyId: string
  ): string {
    // This is a simplified implementation that could be extended with more complex logic
    // to determine the most appropriate strategy based on context
    
    // Example logic for selecting strategy based on context
    if (context.isSubscription && this.strategies.has('tiered-pricing')) {
      return 'tiered-pricing';
    }
    
    if (context.isNearExpiry && this.strategies.has('dynamic-markdown')) {
      return 'dynamic-markdown';
    }
    
    if (context.quantity && context.quantity > 10 && this.strategies.has('volume-pricing')) {
      return 'volume-pricing';
    }
    
    if (context.customerId && context.negotiatedPrices && this.strategies.has('negotiated-pricing')) {
      return 'negotiated-pricing';
    }
    
    // Fall back to default strategy
    return defaultStrategyId;
  }
}
