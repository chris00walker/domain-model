import { Result, success, failure } from '@shared/core/Result';
import { Money } from '@shared/domain/value-objects/Money';
import { PricingTier, PricingTierType } from '../../domain/value-objects/PricingTier';
import { PriceCalculationService } from '../../domain/services/PriceCalculationService';
import { PromotionStackingService } from '../../domain/services/PromotionStackingService';
import { MarginGuardRailService } from '../../domain/services/MarginGuardRailService';
import { PricingGovernanceService } from '../../domain/services/PricingGovernanceService';
import { ISegmentPricingConfigRepository } from '../../domain/repositories/ISegmentPricingConfigRepository';
import { IPromotionalCampaignRepository } from '../../domain/repositories/IPromotionalCampaignRepository';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

/**
 * Application service for calculating prices in order workflows
 */
export class PriceQuotationService {
  private priceCalculationService: PriceCalculationService;
  private promotionStackingService: PromotionStackingService;
  private marginGuardRailService: MarginGuardRailService;
  private pricingGovernanceService: PricingGovernanceService;
  private segmentPricingConfigRepository: ISegmentPricingConfigRepository;
  private promotionalCampaignRepository: IPromotionalCampaignRepository;

  constructor(
    priceCalculationService: PriceCalculationService,
    promotionStackingService: PromotionStackingService,
    marginGuardRailService: MarginGuardRailService,
    pricingGovernanceService: PricingGovernanceService,
    segmentPricingConfigRepository: ISegmentPricingConfigRepository,
    promotionalCampaignRepository: IPromotionalCampaignRepository
  ) {
    this.priceCalculationService = priceCalculationService;
    this.promotionStackingService = promotionStackingService;
    this.marginGuardRailService = marginGuardRailService;
    this.pricingGovernanceService = pricingGovernanceService;
    this.segmentPricingConfigRepository = segmentPricingConfigRepository;
    this.promotionalCampaignRepository = promotionalCampaignRepository;
  }

  /**
   * Calculate the price for a product based on customer segment and other factors
   * @param dto Data for calculating the product price
   * @returns Result containing the calculated price or an error
   */
  public async calculateProductPrice(dto: {
    productId: string;
    baseCost: number;
    currency: string;
    quantity: number;
    customerTierType: PricingTierType;
    promotionCode?: string;
    isSubscription?: boolean;
    subscriptionTier?: string;
    daysRemainingBeforeExpiry?: number;
  }): Promise<Result<Money, string>> {
    const {
      productId,
      baseCost,
      currency,
      quantity,
      customerTierType,
      promotionCode,
      isSubscription,
      subscriptionTier,
      daysRemainingBeforeExpiry
    } = dto;

    // Create Money object for base cost
    const baseCostResult = Money.create(baseCost, currency);
    if (baseCostResult.isFailure()) {
      return failure(baseCostResult.error);
    }

    // Create PricingTier
    const pricingTierResult = PricingTier.create(customerTierType);
    if (pricingTierResult.isFailure()) {
      return failure(pricingTierResult.error);
    }
    const pricingTier = pricingTierResult.value;

    // Get segment pricing configuration
    const segmentConfig = await this.segmentPricingConfigRepository.findByTierType(customerTierType);
    if (!segmentConfig) {
      return failure(`No pricing configuration found for tier ${customerTierType}`);
    }

    // Check if dynamic pricing is frozen for this tier
    if (daysRemainingBeforeExpiry !== undefined && 
        this.pricingGovernanceService.isDynamicPricingFrozen(customerTierType)) {
      // If dynamic pricing is frozen, fall back to standard pricing
      daysRemainingBeforeExpiry = undefined;
    }

    // Determine appropriate pricing strategy
    let strategyId = segmentConfig.defaultPricingStrategy;
    
    // Override strategy based on context
    if (isSubscription && subscriptionTier) {
      strategyId = 'tiered-pricing';
    } else if (daysRemainingBeforeExpiry !== undefined) {
      strategyId = 'dynamic-markdown';
    } else if (quantity > 10) {
      strategyId = 'volume-pricing';
    }

    // Handle promotion code if provided
    let appliedPromotion = undefined;
    if (promotionCode) {
      const campaign = await this.promotionalCampaignRepository.findByCode(promotionCode);
      if (campaign && campaign.isCurrentlyActive() && !campaign.hasReachedUsageLimit()) {
        // Check if campaign applies to this product
        if (campaign.productIds.includes(productId) && campaign.isApplicableTo(pricingTier)) {
          appliedPromotion = campaign.priceModifier;
          
          // Increment usage count
          campaign.incrementUsageCount();
          await this.promotionalCampaignRepository.save(campaign);
        } else {
          return failure(`Promotion code ${promotionCode} is not applicable to this product or customer tier`);
        }
      } else {
        return failure(`Promotion code ${promotionCode} is invalid, inactive, or has reached its usage limit`);
      }
    }

    // Prepare pricing context
    const context: any = {
      baseCost: baseCostResult.value,
      quantity,
      pricingTier,
      priceModifiers: appliedPromotion ? [appliedPromotion] : undefined
    };

    // Add strategy-specific context data
    if (isSubscription && subscriptionTier) {
      context.subscriptionTier = subscriptionTier;
      context.isRecurringFee = false;
      context.applyStoreWideDiscount = true;
    } else if (daysRemainingBeforeExpiry !== undefined) {
      // Dynamic markdown context
      context.daysRemaining = daysRemainingBeforeExpiry;
      // Sample values for demo purposes - in a real system these would be calculated
      context.demandFactor = 0.7; // Higher is better demand
      context.profitabilityFactor = 0.6; // Higher is better profitability
    } else if (quantity > 10) {
      // Volume pricing has all it needs in the base context
    }

    // Calculate price
    return this.priceCalculationService.calculatePrice(
      strategyId,
      context,
      productId
    );
  }

  /**
   * Calculate subscription plan price
   * @param dto Data for calculating the subscription price
   * @returns Result containing the calculated price or an error
   */
  public async calculateSubscriptionPrice(dto: {
    planId: string;
    tierType: string;
    baseCost: number;
    currency: string;
    customerTierType: PricingTierType;
  }): Promise<Result<Money, string>> {
    const {
      planId,
      tierType,
      baseCost,
      currency,
      customerTierType
    } = dto;

    // Create Money object for base cost
    const baseCostResult = Money.create(baseCost, currency);
    if (baseCostResult.isFailure()) {
      return failure(baseCostResult.error);
    }

    // Create PricingTier
    const pricingTierResult = PricingTier.create(customerTierType);
    if (pricingTierResult.isFailure()) {
      return failure(pricingTierResult.error);
    }

    // Prepare pricing context for subscription
    const context: any = {
      baseCost: baseCostResult.value,
      quantity: 1,
      pricingTier: pricingTierResult.value,
      subscriptionTier: tierType,
      isRecurringFee: true,
    };

    // Calculate price using tiered pricing strategy
    return this.priceCalculationService.calculatePrice(
      'tiered-pricing',
      context,
      planId
    );
  }

  /**
   * Calculate order total price with applicable promotions
   * @param dto Data for calculating the order total
   * @returns Result containing the calculated total price or an error
   */
  public async calculateOrderTotal(dto: {
    orderId: string;
    lineItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    currency: string;
    customerTierType: PricingTierType;
    promotionCodes?: string[];
  }): Promise<Result<Money, string>> {
    const {
      orderId,
      lineItems,
      currency,
      customerTierType,
      promotionCodes
    } = dto;

    if (!lineItems || lineItems.length === 0) {
      return failure('Order must contain at least one line item');
    }

    // Validate that all line items use the same currency
    for (const item of lineItems) {
      if (item.quantity <= 0) {
        return failure(`Quantity must be positive for product ${item.productId}`);
      }
      if (item.unitPrice <= 0) {
        return failure(`Unit price must be positive for product ${item.productId}`);
      }
    }

    // Calculate subtotal without promotions
    let subtotal = 0;
    for (const item of lineItems) {
      subtotal += item.unitPrice * item.quantity;
    }
    
    const subtotalResult = Money.create(subtotal, currency);
    if (subtotalResult.isFailure()) {
      return failure(subtotalResult.error);
    }

    // If no promotion codes, return the subtotal
    if (!promotionCodes || promotionCodes.length === 0) {
      return success(subtotalResult.value);
    }

    // Validate one-promo-per-order rule
    if (promotionCodes.length > 1) {
      return failure('Only one promotion code can be applied per order');
    }

    // Get the promotion
    const campaign = await this.promotionalCampaignRepository.findByCode(promotionCodes[0]);
    if (!campaign || !campaign.isCurrentlyActive() || campaign.hasReachedUsageLimit()) {
      return failure(`Promotion code ${promotionCodes[0]} is invalid, inactive, or has reached its usage limit`);
    }

    // Create PricingTier
    const pricingTierResult = PricingTier.create(customerTierType);
    if (pricingTierResult.isFailure()) {
      return failure(pricingTierResult.error);
    }

    // Check if promotion applies to this customer tier
    if (!campaign.isApplicableTo(pricingTierResult.value)) {
      return failure(`Promotion code ${promotionCodes[0]} is not applicable to this customer tier`);
    }

    // Apply the promotion to the subtotal
    const modifiedPriceResult = campaign.priceModifier.applyToPrice(subtotalResult.value);
    if (modifiedPriceResult.isFailure()) {
      return failure(`Failed to apply promotion: ${modifiedPriceResult.error}`);
    }

    // Increment usage count
    campaign.incrementUsageCount();
    await this.promotionalCampaignRepository.save(campaign);

    return success(modifiedPriceResult.value);
  }

  /**
   * Preview available promotions for a product
   * @param productId The product ID
   * @param customerTierType The customer's pricing tier type
   * @returns Array of applicable promotion codes and their descriptions
   */
  public async previewAvailablePromotions(
    productId: string,
    customerTierType: PricingTierType
  ): Promise<Array<{ code: string; description: string; discountValue: string }>> {
    // Create PricingTier
    const pricingTierResult = PricingTier.create(customerTierType);
    if (pricingTierResult.isFailure()) {
      return [];
    }

    // Get active campaigns for this product
    const campaigns = await this.promotionalCampaignRepository.findActiveByProductId(productId);
    
    // Filter campaigns applicable to this customer tier
    const applicableCampaigns = campaigns.filter(
      campaign => campaign.isApplicableTo(pricingTierResult.value) && 
                  !campaign.hasReachedUsageLimit() &&
                  campaign.code // Only include campaigns with codes
    );

    // Format response
    return applicableCampaigns.map(campaign => ({
      code: campaign.code!,
      description: campaign.description,
      discountValue: campaign.priceModifier.toString()
    }));
  }
}
