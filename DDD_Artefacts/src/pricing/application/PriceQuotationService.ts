import { Result, success, failure } from '@shared/core/Result';

import { PriceCalculationService } from '../domain/services/PriceCalculationService';
import { MarginGuardRailService } from '../domain/services/MarginGuardRailService';
import { PromotionStackingService } from '../domain/services/PromotionStackingService';
import { IPricingStrategyRepository } from '../domain/repositories/IPricingStrategyRepository';
import { IPromotionalCampaignRepository } from '../domain/repositories/IPromotionalCampaignRepository';
import { ISegmentPricingConfigRepository } from '../domain/repositories/ISegmentPricingConfigRepository';
import { PricingTier } from '../domain/value-objects/PricingTier';

/**
 * DTO for price calculation request
 */
interface PriceCalculationRequestDTO {
  customerId: string;
  pricingTierId: string;
  productId: string;
  quantity: number;
  baseUnitCost: number; // Cost price in smallest currency unit (e.g., cents)
  promotionalCampaignIds?: string[]; // Optional promotional campaigns to apply
}

/**
 * DTO for calculated price response
 */
interface PriceCalculationResponseDTO {
  unitCost: number; // Original cost in smallest currency unit
  unitPrice: number; // Final selling price in smallest currency unit
  baseUnitPrice: number; // Pre-discount price in smallest currency unit
  quantity: number;
  totalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  appliedPromotions: Array<{
    id: string;
    name: string;
    discountAmount: number;
  }>;
  margin: {
    amount: number;
    percentage: number;
  };
}

/**
 * Application service responsible for calculating prices in order workflows
 */
export class PriceQuotationService {
  constructor(
    private priceCalculationService: PriceCalculationService,
    private marginGuardRailService: MarginGuardRailService,
    private promotionStackingService: PromotionStackingService,
    private pricingStrategyRepository: IPricingStrategyRepository,
    private promotionalCampaignRepository: IPromotionalCampaignRepository,
    private segmentPricingConfigRepository: ISegmentPricingConfigRepository
  ) {}

  /**
   * Calculate the price for a product
   */
  public async calculatePrice(
    request: PriceCalculationRequestDTO
  ): Promise<Result<PriceCalculationResponseDTO, string>> {
    try {
      // Retrieve pricing tier
      const pricingTier = await this.segmentPricingConfigRepository.findPricingTierById(request.pricingTierId);
      if (!pricingTier) {
        return failure(`Pricing tier with ID ${request.pricingTierId} not found`);
      }

      // Get segment pricing configuration for this tier
      const segmentConfig = await this.segmentPricingConfigRepository.findByPricingTier(pricingTier);
      if (!segmentConfig) {
        return failure(`No pricing configuration found for tier ${pricingTier.name}`);
      }

      // Retrieve the default pricing strategy
      const pricingStrategy = await this.pricingStrategyRepository.findById(segmentConfig.defaultPricingStrategy);
      if (!pricingStrategy) {
        return failure(`Pricing strategy with ID ${segmentConfig.defaultPricingStrategy} not found`);
      }

      // Retrieve applicable promotions
      const promotions = [];
      if (request.promotionalCampaignIds && request.promotionalCampaignIds.length > 0) {
        // Check promotion stacking rules
        const stackingResult = this.promotionStackingService.validatePromotionStack(
          request.promotionalCampaignIds.length
        );
        
        if (stackingResult.isFailure()) {
          return failure(`Promotion stacking violation: ${stackingResult.error}`);
        }

        // Retrieve and validate each promotion
        for (const promoId of request.promotionalCampaignIds) {
          const promotion = await this.promotionalCampaignRepository.findById(promoId);
          if (!promotion) {
            return failure(`Promotional campaign with ID ${promoId} not found`);
          }

          // Check if promotion is active
          if (!promotion.isActive) {
            return failure(`Promotional campaign '${promotion.name}' is not active`);
          }

          // Check if promotion is valid for the current date
          const now = new Date();
          if (now < promotion.startDate || now > promotion.endDate) {
            return failure(`Promotional campaign '${promotion.name}' is not valid for the current date`);
          }

          // Check if promotion applies to this pricing tier
          if (!promotion.isApplicableToPricingTier(pricingTier)) {
            return failure(`Promotional campaign '${promotion.name}' is not applicable to pricing tier ${pricingTier.name}`);
          }

          promotions.push(promotion);
        }
      }

      // Calculate price using the selected strategy
      const priceCalculationResult = await this.priceCalculationService.calculatePrice({
        productId: request.productId,
        customer: {
          id: request.customerId,
          pricingTier
        },
        quantity: request.quantity,
        unitCost: request.baseUnitCost,
        baseMarkupPercentage: segmentConfig.baseMarkupPercentage.value,
        promotions
      });

      if (priceCalculationResult.isFailure()) {
        return failure(`Price calculation failed: ${priceCalculationResult.error}`);
      }

      const calculatedPrice = priceCalculationResult.value;

      // Check margin against guard rails
      const marginCheckResult = this.marginGuardRailService.checkMargin(
        calculatedPrice.unitPrice,
        request.baseUnitCost,
        segmentConfig.floorGrossMarginPercentage
      );

      if (marginCheckResult.isFailure()) {
        return failure(`Margin check failed: ${marginCheckResult.error}`);
      }

      // Prepare response DTO
      const response: PriceCalculationResponseDTO = {
        unitCost: request.baseUnitCost,
        unitPrice: calculatedPrice.unitPrice,
        baseUnitPrice: calculatedPrice.baseUnitPrice,
        quantity: request.quantity,
        totalPrice: calculatedPrice.unitPrice * request.quantity,
        discountAmount: calculatedPrice.discountAmount,
        discountPercentage: calculatedPrice.discountPercentage,
        appliedPromotions: calculatedPrice.appliedPromotions.map(p => ({
          id: p.id,
          name: p.name,
          discountAmount: p.discountAmount
        })),
        margin: {
          amount: calculatedPrice.unitPrice - request.baseUnitCost,
          percentage: ((calculatedPrice.unitPrice - request.baseUnitCost) / calculatedPrice.unitPrice) * 100
        }
      };

      return success(response);
    } catch (error) {
      return failure(`Unexpected error calculating price: ${error.message}`);
    }
  }

  /**
   * Calculate prices for multiple products in bulk
   */
  public async calculateBulkPrices(
    requests: PriceCalculationRequestDTO[]
  ): Promise<Result<PriceCalculationResponseDTO[], string>> {
    try {
      const results: PriceCalculationResponseDTO[] = [];
      
      for (const request of requests) {
        const result = await this.calculatePrice(request);
        if (result.isFailure()) {
          return failure(`Failed to calculate price for product ${request.productId}: ${result.error}`);
        }
        
        results.push(result.value);
      }
      
      return success(results);
    } catch (error) {
      return failure(`Unexpected error calculating bulk prices: ${error.message}`);
    }
  }

  /**
   * Get applicable promotional campaigns for a customer
   */
  public async getApplicablePromotions(
    customerId: string,
    pricingTierId: string
  ): Promise<Result<Array<{ id: string; name: string; description: string }>, string>> {
    try {
      // Retrieve pricing tier
      const pricingTier = await this.segmentPricingConfigRepository.findPricingTierById(pricingTierId);
      if (!pricingTier) {
        return failure(`Pricing tier with ID ${pricingTierId} not found`);
      }

      // Get active promotions
      const allPromotions = await this.promotionalCampaignRepository.findActive();
      
      // Filter promotions by applicable pricing tier and current date
      const now = new Date();
      const applicablePromotions = allPromotions.filter(promo => 
        promo.isApplicableToPricingTier(pricingTier) &&
        now >= promo.startDate &&
        now <= promo.endDate
      );

      // Map to DTO
      const promotionDTOs = applicablePromotions.map(promo => ({
        id: promo.id.toString(),
        name: promo.name,
        description: promo.description
      }));

      return success(promotionDTOs);
    } catch (error) {
      return failure(`Unexpected error retrieving applicable promotions: ${error.message}`);
    }
  }

  /**
   * Simulate price changes based on different pricing tiers
   */
  public async simulatePriceTierChange(
    productId: string,
    quantity: number,
    baseUnitCost: number,
    currentPricingTierId: string,
    targetPricingTierId: string
  ): Promise<Result<{ current: PriceCalculationResponseDTO; target: PriceCalculationResponseDTO }, string>> {
    try {
      // Calculate price with current tier
      const currentRequest: PriceCalculationRequestDTO = {
        customerId: 'simulation',
        pricingTierId: currentPricingTierId,
        productId,
        quantity,
        baseUnitCost
      };

      const currentResult = await this.calculatePrice(currentRequest);
      if (currentResult.isFailure()) {
        return failure(`Failed to calculate price with current tier: ${currentResult.error}`);
      }

      // Calculate price with target tier
      const targetRequest: PriceCalculationRequestDTO = {
        customerId: 'simulation',
        pricingTierId: targetPricingTierId,
        productId,
        quantity,
        baseUnitCost
      };

      const targetResult = await this.calculatePrice(targetRequest);
      if (targetResult.isFailure()) {
        return failure(`Failed to calculate price with target tier: ${targetResult.error}`);
      }

      return success({
        current: currentResult.value,
        target: targetResult.value
      });
    } catch (error) {
      return failure(`Unexpected error simulating price tier change: ${error.message}`);
    }
  }
}
