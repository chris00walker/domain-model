import { Result, success, failure } from '@shared/core/Result';
import { Money } from '@shared/domain/value-objects/Money';
import { PricingTier } from '../value-objects/PricingTier';
import { MarginFloorBreached } from '../events/MarginFloorBreached';
import { IDomainEventPublisher } from '@shared/domain/events/IDomainEventPublisher';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

/**
 * Service that enforces margin floor constraints as defined in the business model
 */
export class MarginGuardRailService {
  private eventPublisher?: IDomainEventPublisher;
  private marginViolationHistory: Map<string, Date[]>; // Map of tier ID to violation dates

  constructor(eventPublisher?: IDomainEventPublisher) {
    this.eventPublisher = eventPublisher;
    this.marginViolationHistory = new Map<string, Date[]>();
  }

  /**
   * Calculate the margin percentage based on selling price and cost
   * @param sellingPrice The selling price
   * @param cost The cost
   * @returns The calculated margin percentage or an error
   */
  public calculateMarginPercentage(sellingPrice: Money, cost: Money): Result<number, string> {
    if (sellingPrice.currency !== cost.currency) {
      return failure(`Currency mismatch: selling price is in ${sellingPrice.currency} but cost is in ${cost.currency}`);
    }

    if (sellingPrice.amount <= 0) {
      return failure('Selling price must be positive');
    }

    const grossProfit = sellingPrice.subtract(cost);
    if (grossProfit.isFailure()) {
      return failure(`Failed to calculate gross profit: ${grossProfit.error}`);
    }

    const marginPercentage = (grossProfit.value.amount / sellingPrice.amount) * 100;
    return success(marginPercentage);
  }

  /**
   * Check if a given price meets the margin floor requirement for a pricing tier
   * @param sellingPrice The selling price to check
   * @param cost The cost
   * @param pricingTier The pricing tier to check against
   * @param productId Optional product ID for event publishing
   * @param orderId Optional order ID for event publishing
   * @returns Success if the margin is acceptable, failure if the margin is below the floor
   */
  public checkMarginFloor(
    sellingPrice: Money, 
    cost: Money, 
    pricingTier: PricingTier,
    productId?: string,
    orderId?: string
  ): Result<void, string> {
    const marginResult = this.calculateMarginPercentage(sellingPrice, cost);
    if (marginResult.isFailure()) {
      return failure(marginResult.error);
    }

    const calculatedMargin = marginResult.value;
    const floorMargin = pricingTier.getFloorGrossMarginPercentage();

    if (calculatedMargin < floorMargin) {
      const calculationId = new UniqueEntityID().toString();
      
      // Record this violation
      this.recordMarginViolation(pricingTier.type);
      
      // Publish event if publisher is available and product ID is provided
      if (this.eventPublisher && productId) {
        const event = new MarginFloorBreached(
          productId,
          sellingPrice.amount,
          cost.amount,
          sellingPrice.currency,
          calculatedMargin,
          floorMargin,
          pricingTier.type,
          calculationId,
          orderId
        );
        
        this.eventPublisher.publish(event);
      }
      
      return failure(`Calculated margin (${calculatedMargin.toFixed(2)}%) is below the floor margin (${floorMargin}%) for tier ${pricingTier.type}`);
    }

    return success(undefined);
  }

  /**
   * Calculate the minimum selling price that satisfies the margin floor
   * @param cost The cost
   * @param pricingTier The pricing tier
   * @returns The minimum acceptable selling price or an error
   */
  public calculateMinimumSellingPrice(cost: Money, pricingTier: PricingTier): Result<Money, string> {
    const floorMarginPercentage = pricingTier.getFloorGrossMarginPercentage();
    
    if (floorMarginPercentage >= 100) {
      return failure(`Invalid floor margin percentage: ${floorMarginPercentage}%`);
    }
    
    // Convert percentage to decimal (e.g., 30% -> 0.3)
    const floorMarginDecimal = floorMarginPercentage / 100;
    
    // Calculate minimum selling price: cost / (1 - margin%)
    const minSellingPriceAmount = cost.amount / (1 - floorMarginDecimal);
    
    // Create Money object for the result
    return Money.create(minSellingPriceAmount, cost.currency);
  }

  /**
   * Record a margin violation for a pricing tier
   * @param tierType The pricing tier type
   */
  private recordMarginViolation(tierType: string): void {
    const now = new Date();
    const violations = this.marginViolationHistory.get(tierType) || [];
    
    // Add current violation
    violations.push(now);
    
    // Keep only violations from the last 2 weeks
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    const recentViolations = violations.filter(date => date >= twoWeeksAgo);
    
    this.marginViolationHistory.set(tierType, recentViolations);
  }

  /**
   * Check if a pricing tier has exceeded the margin violation threshold
   * This implements the business rule that pricing engine should be frozen if
   * gross margin falls below floor for two consecutive weeks
   * @param tierType The pricing tier type
   * @returns True if the threshold is exceeded, false otherwise
   */
  public hasTierExceededViolationThreshold(tierType: string): boolean {
    const violations = this.marginViolationHistory.get(tierType) || [];
    if (violations.length === 0) {
      return false;
    }
    
    // Count violations in the last week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    
    const lastWeekViolations = violations.filter(date => date >= oneWeekAgo).length;
    const previousWeekViolations = violations.filter(date => date >= twoWeeksAgo && date < oneWeekAgo).length;
    
    // Threshold is exceeded if there were violations in both the current and previous weeks
    return lastWeekViolations > 0 && previousWeekViolations > 0;
  }

  /**
   * Get the count of margin violations for a pricing tier in the last two weeks
   * @param tierType The pricing tier type
   * @returns The count of violations
   */
  public getRecentViolationCount(tierType: string): number {
    const violations = this.marginViolationHistory.get(tierType) || [];
    return violations.length;
  }

  /**
   * Clear violation history for a pricing tier
   * This would be called after a formal CFO-approved review
   * @param tierType The pricing tier type
   */
  public clearViolationHistory(tierType: string): void {
    this.marginViolationHistory.delete(tierType);
  }
}
