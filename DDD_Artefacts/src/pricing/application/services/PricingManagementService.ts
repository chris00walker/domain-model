import { Result, success, failure } from '@shared/core/Result';
import { PricingTier, PricingTierType } from '../../domain/value-objects/PricingTier';
import { MarkupPercentage } from '../../domain/value-objects/MarkupPercentage';
import { DiscountPercentage } from '../../domain/value-objects/DiscountPercentage';
import { SegmentPricingConfig } from '../../domain/aggregates/SegmentPricingConfig';
import { PromotionalCampaign, CampaignType, CampaignStatus } from '../../domain/aggregates/PromotionalCampaign';
import { PriceModifier, PriceModifierType } from '../../domain/value-objects/PriceModifier';
import { PricingRule, RuleConditionType } from '../../domain/entities/PricingRule';
import { ISegmentPricingConfigRepository } from '../../domain/repositories/ISegmentPricingConfigRepository';
import { IPromotionalCampaignRepository } from '../../domain/repositories/IPromotionalCampaignRepository';
import { IPricingStrategyRepository } from '../../domain/repositories/IPricingStrategyRepository';
import { PricingGovernanceService } from '../../domain/services/PricingGovernanceService';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

/**
 * Application service for managing pricing configurations, strategies, and campaigns
 */
export class PricingManagementService {
  private segmentPricingConfigRepository: ISegmentPricingConfigRepository;
  private promotionalCampaignRepository: IPromotionalCampaignRepository;
  private pricingStrategyRepository: IPricingStrategyRepository;
  private pricingGovernanceService: PricingGovernanceService;

  constructor(
    segmentPricingConfigRepository: ISegmentPricingConfigRepository,
    promotionalCampaignRepository: IPromotionalCampaignRepository,
    pricingStrategyRepository: IPricingStrategyRepository,
    pricingGovernanceService: PricingGovernanceService
  ) {
    this.segmentPricingConfigRepository = segmentPricingConfigRepository;
    this.promotionalCampaignRepository = promotionalCampaignRepository;
    this.pricingStrategyRepository = pricingStrategyRepository;
    this.pricingGovernanceService = pricingGovernanceService;
  }

  /**
   * Create or update a segment pricing configuration
   * @param tierType The pricing tier type
   * @param baseMarkupPercentage The base markup percentage
   * @param maxDiscountPercentage The maximum discount percentage
   * @param floorGrossMarginPercentage The floor gross margin percentage
   * @param targetGrossMarginPercentage The target gross margin percentage
   * @param defaultPricingStrategyId The ID of the default pricing strategy
   * @param notes Optional notes
   * @returns Result containing the created/updated configuration ID or an error
   */
  public async createOrUpdateSegmentPricingConfig(
    tierType: PricingTierType,
    baseMarkupPercentage: number,
    maxDiscountPercentage: number,
    floorGrossMarginPercentage: number,
    targetGrossMarginPercentage: number,
    defaultPricingStrategyId: string,
    notes?: string
  ): Promise<Result<string, string>> {
    // Validate inputs
    const tierResult = PricingTier.create(tierType);
    if (tierResult.isFailure()) {
      return failure(tierResult.error);
    }

    const markupResult = MarkupPercentage.create(baseMarkupPercentage);
    if (markupResult.isFailure()) {
      return failure(markupResult.error);
    }

    const discountResult = DiscountPercentage.create(maxDiscountPercentage);
    if (discountResult.isFailure()) {
      return failure(discountResult.error);
    }

    // Check if strategy exists
    const strategy = await this.pricingStrategyRepository.findById(defaultPricingStrategyId);
    if (!strategy) {
      return failure(`Pricing strategy with ID ${defaultPricingStrategyId} not found`);
    }

    // Check if config already exists for this tier
    const existingConfig = await this.segmentPricingConfigRepository.findByTierType(tierType);
    const now = new Date();

    let config: SegmentPricingConfig;

    if (existingConfig) {
      // Update existing config
      existingConfig.updateMarkupPercentage(markupResult.value);
      existingConfig.updateMaxDiscountPercentage(discountResult.value);
      
      const marginResult = existingConfig.updateMarginPercentages(
        floorGrossMarginPercentage,
        targetGrossMarginPercentage
      );
      
      if (marginResult.isFailure()) {
        return failure(marginResult.error);
      }
      
      existingConfig.updateDefaultPricingStrategy(defaultPricingStrategyId);
      existingConfig.updateNotes(notes);
      
      config = existingConfig;
    } else {
      // Create new config
      const configResult = SegmentPricingConfig.create({
        pricingTier: tierResult.value,
        baseMarkupPercentage: markupResult.value,
        maxDiscountPercentage: discountResult.value,
        floorGrossMarginPercentage,
        targetGrossMarginPercentage,
        defaultPricingStrategy: defaultPricingStrategyId,
        notes,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      if (configResult.isFailure()) {
        return failure(configResult.error);
      }
      
      config = configResult.value;
    }

    // Save the config
    await this.segmentPricingConfigRepository.save(config);
    
    return success(config.id.toString());
  }

  /**
   * Create a new promotional campaign
   * @param dto Data for creating a promotional campaign
   * @returns Result containing the created campaign ID or an error
   */
  public async createPromotionalCampaign(dto: {
    name: string;
    description: string;
    type: CampaignType;
    startDate: Date;
    endDate: Date;
    applicableTierTypes: PricingTierType[];
    priceModifierType: PriceModifierType;
    priceModifierValue: number;
    priceModifierName: string;
    priceModifierDescription: string;
    productIds: string[];
    categoryIds?: string[];
    maxUsageCount?: number;
    code?: string;
  }): Promise<Result<string, string>> {
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      applicableTierTypes,
      priceModifierType,
      priceModifierValue,
      priceModifierName,
      priceModifierDescription,
      productIds,
      categoryIds,
      maxUsageCount,
      code
    } = dto;

    // Validate inputs
    if (startDate >= endDate) {
      return failure('Start date must be before end date');
    }

    if (!applicableTierTypes || applicableTierTypes.length === 0) {
      return failure('At least one applicable pricing tier must be specified');
    }

    if (!productIds || productIds.length === 0) {
      return failure('At least one product ID must be specified');
    }

    // Create applicable pricing tiers
    const pricingTiers: PricingTier[] = [];
    for (const tierType of applicableTierTypes) {
      const tierResult = PricingTier.create(tierType);
      if (tierResult.isFailure()) {
        return failure(tierResult.error);
      }
      pricingTiers.push(tierResult.value);
    }

    // Create price modifier
    let priceModifierResult;
    switch (priceModifierType) {
      case PriceModifierType.PERCENTAGE_DISCOUNT:
        priceModifierResult = PriceModifier.createPercentageDiscount(
          priceModifierName,
          priceModifierDescription,
          priceModifierValue
        );
        break;
      case PriceModifierType.FIXED_DISCOUNT:
        // Note: Currency is hardcoded to BBD here but should be parameterized in a real implementation
        priceModifierResult = PriceModifier.createFixedDiscount(
          priceModifierName,
          priceModifierDescription,
          priceModifierValue,
          'BBD'
        );
        break;
      default:
        return failure(`Unsupported price modifier type: ${priceModifierType}`);
    }

    if (priceModifierResult.isFailure()) {
      return failure(priceModifierResult.error);
    }

    // Create a basic pricing rule for the campaign
    const rule = PricingRule.create({
      name: `Rule for ${name}`,
      description: `Automatically generated rule for campaign: ${name}`,
      conditions: [
        {
          type: RuleConditionType.PRODUCT_CATEGORY,
          value: productIds,
          operator: 'CONTAINS'
        }
      ],
      priceModifier: priceModifierResult.value,
      applicableTiers: pricingTiers,
      startDate,
      endDate,
      isActive: true,
      priority: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (rule.isFailure()) {
      return failure(rule.error);
    }

    // Create the campaign
    const campaignResult = PromotionalCampaign.create({
      name,
      description,
      type,
      status: CampaignStatus.DRAFT,
      startDate,
      endDate,
      applicableTiers: pricingTiers,
      priceModifier: priceModifierResult.value,
      pricingRules: [rule.value],
      productIds,
      categoryIds,
      maxUsageCount,
      currentUsageCount: 0,
      code,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (campaignResult.isFailure()) {
      return failure(campaignResult.error);
    }

    // Save the campaign
    await this.promotionalCampaignRepository.save(campaignResult.value);
    
    return success(campaignResult.value.id.toString());
  }

  /**
   * Activate a promotional campaign
   * @param campaignId The campaign ID
   * @returns Result containing success flag or an error
   */
  public async activatePromotionalCampaign(campaignId: string): Promise<Result<void, string>> {
    const campaign = await this.promotionalCampaignRepository.findById(campaignId);
    if (!campaign) {
      return failure(`Campaign with ID ${campaignId} not found`);
    }

    const result = campaign.activate();
    if (result.isFailure()) {
      return failure(result.error);
    }

    await this.promotionalCampaignRepository.save(campaign);
    return success(undefined);
  }

  /**
   * Deactivate a promotional campaign
   * @param campaignId The campaign ID
   * @returns Result containing success flag or an error
   */
  public async deactivatePromotionalCampaign(campaignId: string): Promise<Result<void, string>> {
    const campaign = await this.promotionalCampaignRepository.findById(campaignId);
    if (!campaign) {
      return failure(`Campaign with ID ${campaignId} not found`);
    }

    const result = campaign.pause();
    if (result.isFailure()) {
      return failure(result.error);
    }

    await this.promotionalCampaignRepository.save(campaign);
    return success(undefined);
  }

  /**
   * Approve unfreezing of dynamic pricing after CFO review
   * @param tierType The pricing tier type
   * @param reviewerId The ID of the reviewer (typically the CFO)
   * @param notes Notes from the review
   * @returns Result containing success flag or an error
   */
  public async approvePricingUnfreeze(
    tierType: PricingTierType,
    reviewerId: string,
    notes: string
  ): Promise<Result<void, string>> {
    if (!this.pricingGovernanceService.isDynamicPricingFrozen(tierType)) {
      return failure(`Dynamic pricing is not frozen for tier ${tierType}`);
    }

    return this.pricingGovernanceService.unfreezeDynamicPricing(
      tierType,
      reviewerId,
      notes
    );
  }

  /**
   * Get pricing configuration for a specific tier
   * @param tierType The pricing tier type
   * @returns Result containing the pricing configuration or an error
   */
  public async getPricingConfigForTier(tierType: PricingTierType): Promise<Result<SegmentPricingConfig, string>> {
    const config = await this.segmentPricingConfigRepository.findByTierType(tierType);
    if (!config) {
      return failure(`No pricing configuration found for tier ${tierType}`);
    }

    return success(config);
  }

  /**
   * Get all active promotional campaigns
   * @returns Array of active promotional campaigns
   */
  public async getActivePromotionalCampaigns(): Promise<PromotionalCampaign[]> {
    return this.promotionalCampaignRepository.findCurrentlyActive();
  }

  /**
   * Check if dynamic pricing is frozen for a tier
   * @param tierType The pricing tier type
   * @returns True if frozen, false otherwise
   */
  public isDynamicPricingFrozen(tierType: PricingTierType): boolean {
    return this.pricingGovernanceService.isDynamicPricingFrozen(tierType);
  }

  /**
   * Run the governance check for all pricing tiers
   * @returns Summary of check results
   */
  public runGovernanceCheck(): Record<string, boolean> {
    return this.pricingGovernanceService.runGovernanceCheck();
  }
}
