import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';
import { Clock, SystemClock } from '../../../shared/domain/Clock';
import { SubscriptionRenewed } from '../events/SubscriptionRenewed';
import { SubscriptionCancelled } from '../events/SubscriptionCancelled';
import { SubscriptionPaused } from '../events/SubscriptionPaused';
import { SubscriptionResumed } from '../events/SubscriptionResumed';
import { SubscriptionStatus, SubscriptionStatusType } from '../value-objects/SubscriptionStatus';

export enum SubscriptionFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}

export interface SubscriptionProps {
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  frequency: SubscriptionFrequency;
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  lastBillingDate?: Date;
  price: number;
  currency: string;
  autoRenew: boolean;
  pauseHistory?: Array<{
    startDate: Date;
    endDate?: Date;
    reason?: string;
  }>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastInteractionDate?: Date;
}

/**
 * SubscriptionAggregate represents a customer subscription to a specific plan
 */
export class SubscriptionAggregate extends AggregateRoot<SubscriptionProps> {
  get customerId(): string {
    return this.props.customerId;
  }

  get planId(): string {
    return this.props.planId;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get frequency(): SubscriptionFrequency {
    return this.props.frequency;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get nextBillingDate(): Date {
    return this.props.nextBillingDate;
  }

  get lastBillingDate(): Date | undefined {
    return this.props.lastBillingDate;
  }

  get price(): number {
    return this.props.price;
  }

  get currency(): string {
    return this.props.currency;
  }

  get autoRenew(): boolean {
    return this.props.autoRenew;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: SubscriptionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Create a new subscription
   */
  public static create(props: SubscriptionProps, id?: UniqueEntityID, clock: Clock = new SystemClock()): Result<SubscriptionAggregate, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.customerId, argumentName: 'customerId' },
      { argument: props.planId, argumentName: 'planId' },
      { argument: props.status, argumentName: 'status' },
      { argument: props.frequency, argumentName: 'frequency' },
      { argument: props.startDate, argumentName: 'startDate' },
      { argument: props.nextBillingDate, argumentName: 'nextBillingDate' },
      { argument: props.price, argumentName: 'price' },
      { argument: props.currency, argumentName: 'currency' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    const isNewSubscription = !id;
    const now = clock.now();

    const subscription = new SubscriptionAggregate(
      {
        ...props,
        pauseHistory: props.pauseHistory || [],
        metadata: props.metadata || {},
        createdAt: isNewSubscription ? now : props.createdAt,
        updatedAt: now,
        lastInteractionDate: isNewSubscription ? now : props.lastInteractionDate || now
      },
      id
    );

    return success(subscription);
  }

  /**
   * Check if subscription is active
   */
  public isActive(): boolean {
    return this.props.status.value === SubscriptionStatusType.ACTIVE;
  }

  /**
   * Check if subscription can be renewed
   */
  public canBeRenewed(): boolean {
    return (
      (this.props.status.value === SubscriptionStatusType.ACTIVE || this.props.status.value === SubscriptionStatusType.PAUSED) &&
      this.props.autoRenew
    );
  }

  /**
   * Renew the subscription
   */
  public renew(clock: Clock = new SystemClock()): Result<void, string> {
    if (!this.canBeRenewed()) {
      return failure(`Subscription cannot be renewed in its current state`);
    }

    const now = clock.now();
    const currentFrequency = this.props.frequency;
    
    // Calculate new end date based on frequency
    let newEndDate: Date | undefined;
    if (this.props.endDate) {
      newEndDate = new Date(this.props.endDate);
      
      switch (currentFrequency) {
        case SubscriptionFrequency.WEEKLY:
          newEndDate.setDate(newEndDate.getDate() + 7);
          break;
        case SubscriptionFrequency.BIWEEKLY:
          newEndDate.setDate(newEndDate.getDate() + 14);
          break;
        case SubscriptionFrequency.MONTHLY:
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          break;
        case SubscriptionFrequency.QUARTERLY:
          newEndDate.setMonth(newEndDate.getMonth() + 3);
          break;
      }
    }

    // Calculate next billing date
    const newNextBillingDate = new Date(this.props.nextBillingDate);
    
    switch (currentFrequency) {
      case SubscriptionFrequency.WEEKLY:
        newNextBillingDate.setDate(newNextBillingDate.getDate() + 7);
        break;
      case SubscriptionFrequency.BIWEEKLY:
        newNextBillingDate.setDate(newNextBillingDate.getDate() + 14);
        break;
      case SubscriptionFrequency.MONTHLY:
        newNextBillingDate.setMonth(newNextBillingDate.getMonth() + 1);
        break;
      case SubscriptionFrequency.QUARTERLY:
        newNextBillingDate.setMonth(newNextBillingDate.getMonth() + 3);
        break;
    }

    // Update subscription properties
    this.props.lastBillingDate = now;
    this.props.nextBillingDate = newNextBillingDate;
    this.props.endDate = newEndDate;
    this.props.updatedAt = now;
    this.props.lastInteractionDate = now;
    
    // If subscription was paused, resume it
    if (this.props.status.value === SubscriptionStatusType.PAUSED) {
      const activeStatusResult = SubscriptionStatus.create(SubscriptionStatusType.ACTIVE);
      if (activeStatusResult.isFailure()) {
        return failure(activeStatusResult.getErrorValue());
      }
      this.props.status = activeStatusResult.getValue();
      
      // Update pause history
      if (this.props.pauseHistory && this.props.pauseHistory.length > 0) {
        const lastPause = this.props.pauseHistory[this.props.pauseHistory.length - 1];
        if (!lastPause.endDate) {
          lastPause.endDate = now;
        }
      }
    }

    // Add domain event
    this.addDomainEvent(new SubscriptionRenewed(this as any));

    return success(undefined);
  }

  /**
   * Cancel the subscription
   */
  public cancel(reason: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status.value === SubscriptionStatusType.CANCELLED) {
      return failure('Subscription is already cancelled');
    }

    const now = clock.now();
    const cancelledStatusResult = SubscriptionStatus.create(SubscriptionStatusType.CANCELLED);
    if (cancelledStatusResult.isFailure()) {
      return failure(cancelledStatusResult.getErrorValue());
    }
    this.props.status = cancelledStatusResult.getValue();
    this.props.updatedAt = now;
    this.props.lastInteractionDate = now;
    
    // Add domain event
    this.addDomainEvent(new SubscriptionCancelled(this as any));

    return success(undefined);
  }

  /**
   * Pause the subscription
   */
  public pause(reason?: string, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status.value !== SubscriptionStatusType.ACTIVE) {
      return failure('Only active subscriptions can be paused');
    }

    const now = clock.now();
    const pausedStatusResult = SubscriptionStatus.create(SubscriptionStatusType.PAUSED);
    if (pausedStatusResult.isFailure()) {
      return failure(pausedStatusResult.getErrorValue());
    }
    this.props.status = pausedStatusResult.getValue();
    this.props.updatedAt = now;
    this.props.lastInteractionDate = now;
    
    // Add to pause history
    if (!this.props.pauseHistory) {
      this.props.pauseHistory = [];
    }
    
    this.props.pauseHistory.push({
      startDate: now,
      reason: reason
    });
    
    // Add domain event
    this.addDomainEvent(new SubscriptionPaused(this as any));

    return success(undefined);
  }

  /**
   * Resume the subscription
   */
  public resume(clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status.value !== SubscriptionStatusType.PAUSED) {
      return failure('Only paused subscriptions can be resumed');
    }

    const now = clock.now();
    const activeStatusResult = SubscriptionStatus.create(SubscriptionStatusType.ACTIVE);
    if (activeStatusResult.isFailure()) {
      return failure(activeStatusResult.getErrorValue());
    }
    this.props.status = activeStatusResult.getValue();
    this.props.updatedAt = now;
    this.props.lastInteractionDate = now;
    
    // Update pause history
    if (this.props.pauseHistory && this.props.pauseHistory.length > 0) {
      const lastPause = this.props.pauseHistory[this.props.pauseHistory.length - 1];
      if (!lastPause.endDate) {
        lastPause.endDate = now;
      }
    }
    
    // Add domain event
    this.addDomainEvent(new SubscriptionResumed(this as any));

    return success(undefined);
  }

  /**
   * Change subscription plan
   */
  public changePlan(newPlanId: string, newPrice: number, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status.value === SubscriptionStatusType.CANCELLED) {
      return failure(`Cannot change plan for cancelled subscription`);
    }

    const now = clock.now();
    
    this.props.planId = newPlanId;
    this.props.price = newPrice;
    this.props.updatedAt = now;
    this.props.lastInteractionDate = now;

    return success(undefined);
  }

  /**
   * Toggle auto-renewal
   */
  public setAutoRenew(autoRenew: boolean, clock: Clock = new SystemClock()): Result<void, string> {
    if (this.props.status.value === SubscriptionStatusType.CANCELLED) {
      return failure(`Cannot change auto-renewal for cancelled subscription`);
    }

    const now = clock.now();
    
    this.props.autoRenew = autoRenew;
    this.props.updatedAt = now;
    this.props.lastInteractionDate = now;

    return success(undefined);
  }

  /**
   * Get number of times the subscription has been paused
   */
  public getPauseCount(): number {
    return this.props.pauseHistory ? this.props.pauseHistory.length : 0;
  }

  /**
   * Get days since last interaction
   */
  public getDaysSinceLastInteraction(currentDate: Date): number {
    if (!this.props.lastInteractionDate) {
      return 0;
    }
    
    const diffTime = Math.abs(currentDate.getTime() - this.props.lastInteractionDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if subscription has had a recent price increase
   */
  public hasRecentPriceIncrease(): boolean {
    // This would typically check against price history
    // For now, we'll return a placeholder implementation
    return false;
  }

  /**
   * Get subscription metrics
   */
  public getMetrics(): {
    totalPaid: number;
    averageMonthlyValue: number;
    currency: string;
  } {
    // Calculate total paid based on subscription duration and price
    const startDate = this.props.startDate;
    const endDate = this.props.lastBillingDate || new Date();
    
    // Calculate months between dates
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    // Calculate total paid based on frequency and price
    let totalPaid = 0;
    let paymentsCount = 0;
    
    switch (this.props.frequency) {
      case SubscriptionFrequency.WEEKLY:
        paymentsCount = Math.ceil(months * 4.33); // ~4.33 weeks per month
        break;
      case SubscriptionFrequency.BIWEEKLY:
        paymentsCount = Math.ceil(months * 2.17); // ~2.17 biweekly periods per month
        break;
      case SubscriptionFrequency.MONTHLY:
        paymentsCount = months;
        break;
      case SubscriptionFrequency.QUARTERLY:
        paymentsCount = Math.ceil(months / 3);
        break;
    }
    
    totalPaid = paymentsCount * this.props.price;
    
    // Calculate average monthly value
    const averageMonthlyValue = months > 0 ? totalPaid / months : this.props.price;
    
    return {
      totalPaid,
      averageMonthlyValue,
      currency: this.props.currency
    };
  }
}
