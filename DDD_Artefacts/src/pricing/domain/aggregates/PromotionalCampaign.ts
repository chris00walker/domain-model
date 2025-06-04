import { AggregateRoot } from '@shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { PricingTier } from '../value-objects/PricingTier';
import { PriceModifier } from '../value-objects/PriceModifier';
import { DiscountPercentage } from '../value-objects/DiscountPercentage';
import { PricingRule } from '../entities/PricingRule';
import { PromotionalCampaignCreated } from '../events/PromotionalCampaignCreated';

export enum CampaignType {
  SEASONAL = 'SEASONAL',
  CLEARANCE = 'CLEARANCE',
  NEW_PRODUCT = 'NEW_PRODUCT',
  CUSTOMER_ACQUISITION = 'CUSTOMER_ACQUISITION',
  LOYALTY = 'LOYALTY',
  BUNDLE = 'BUNDLE'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

interface PromotionalCampaignProps {
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  applicableTiers: PricingTier[];
  priceModifier: PriceModifier;
  pricingRules: PricingRule[]; // Rules that determine when this campaign applies
  productIds: string[]; // Products this campaign applies to
  categoryIds?: string[]; // Optional categories this campaign applies to
  maxUsageCount?: number; // Optional limit on number of uses
  currentUsageCount: number;
  code?: string; // Optional promotion code
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate that represents a time-bound promotional campaign with specific pricing rules
 */
export class PromotionalCampaign extends AggregateRoot<PromotionalCampaignProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get type(): CampaignType {
    return this.props.type;
  }

  get status(): CampaignStatus {
    return this.props.status;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get applicableTiers(): PricingTier[] {
    return [...this.props.applicableTiers];
  }

  get priceModifier(): PriceModifier {
    return this.props.priceModifier;
  }

  get pricingRules(): PricingRule[] {
    return [...this.props.pricingRules];
  }

  get productIds(): string[] {
    return [...this.props.productIds];
  }

  get categoryIds(): string[] | undefined {
    return this.props.categoryIds ? [...this.props.categoryIds] : undefined;
  }

  get maxUsageCount(): number | undefined {
    return this.props.maxUsageCount;
  }

  get currentUsageCount(): number {
    return this.props.currentUsageCount;
  }

  get code(): string | undefined {
    return this.props.code;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: PromotionalCampaignProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Create a new PromotionalCampaign aggregate
   */
  public static create(
    props: PromotionalCampaignProps,
    id?: UniqueEntityID
  ): Result<PromotionalCampaign, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.type, argumentName: 'type' },
      { argument: props.status, argumentName: 'status' },
      { argument: props.startDate, argumentName: 'startDate' },
      { argument: props.endDate, argumentName: 'endDate' },
      { argument: props.applicableTiers, argumentName: 'applicableTiers' },
      { argument: props.priceModifier, argumentName: 'priceModifier' },
      { argument: props.pricingRules, argumentName: 'pricingRules' },
      { argument: props.productIds, argumentName: 'productIds' },
      { argument: props.currentUsageCount, argumentName: 'currentUsageCount' },
      { argument: props.createdAt, argumentName: 'createdAt' },
      { argument: props.updatedAt, argumentName: 'updatedAt' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.startDate >= props.endDate) {
      return failure('Start date must be before end date');
    }

    if (props.applicableTiers.length === 0) {
      return failure('At least one applicable pricing tier must be specified');
    }

    if (props.pricingRules.length === 0) {
      return failure('At least one pricing rule must be specified');
    }

    if (props.productIds.length === 0 && (!props.categoryIds || props.categoryIds.length === 0)) {
      return failure('At least one product ID or category ID must be specified');
    }

    if (props.maxUsageCount !== undefined && props.maxUsageCount <= 0) {
      return failure('Maximum usage count must be positive');
    }

    if (props.currentUsageCount < 0) {
      return failure('Current usage count cannot be negative');
    }

    if (props.maxUsageCount !== undefined && props.currentUsageCount > props.maxUsageCount) {
      return failure('Current usage count cannot exceed maximum usage count');
    }

    // Create the campaign
    const campaign = new PromotionalCampaign(props, id);

    // Add a domain event for campaign creation
    campaign.addDomainEvent(new PromotionalCampaignCreated(campaign));

    return success(campaign);
  }

  /**
   * Check if this campaign is applicable to a given pricing tier
   */
  public isApplicableTo(pricingTier: PricingTier): boolean {
    return this.props.applicableTiers.some(tier => tier.equals(pricingTier));
  }
  
  /**
   * Check if this campaign is applicable to a specific pricing tier
   * @param pricingTier The pricing tier to check
   */
  public isApplicableToPricingTier(pricingTier: PricingTier): boolean {
    return this.isApplicableTo(pricingTier);
  }

  /**
   * Check if this campaign is currently active
   */
  public isCurrentlyActive(): boolean {
    const now = new Date();
    return (
      this.props.status === CampaignStatus.ACTIVE &&
      now >= this.props.startDate &&
      now <= this.props.endDate &&
      !this.hasReachedUsageLimit()
    );
  }
  
  /**
   * Check if this campaign is active (has ACTIVE status)
   */
  public get isActive(): boolean {
    return this.props.status === CampaignStatus.ACTIVE;
  }

  /**
   * Check if this campaign has reached its usage limit
   */
  public hasReachedUsageLimit(): boolean {
    return this.props.maxUsageCount !== undefined && 
           this.props.currentUsageCount >= this.props.maxUsageCount;
  }

  /**
   * Increment the usage count for this campaign
   */
  public incrementUsageCount(): Result<void, string> {
    if (this.hasReachedUsageLimit()) {
      return failure('Campaign has reached its usage limit');
    }

    this.props.currentUsageCount += 1;
    this.props.updatedAt = new Date();

    return success(undefined);
  }

  /**
   * Update the campaign status
   */
  public updateStatus(status: CampaignStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  /**
   * Update the campaign date range
   */
  public updateDateRange(startDate: Date, endDate: Date): Result<void, string> {
    if (startDate >= endDate) {
      return failure('Start date must be before end date');
    }

    this.props.startDate = startDate;
    this.props.endDate = endDate;
    this.props.updatedAt = new Date();

    return success(undefined);
  }

  /**
   * Add a product ID to this campaign
   */
  public addProductId(productId: string): void {
    if (!this.props.productIds.includes(productId)) {
      this.props.productIds.push(productId);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Remove a product ID from this campaign
   */
  public removeProductId(productId: string): boolean {
    const initialLength = this.props.productIds.length;
    this.props.productIds = this.props.productIds.filter(id => id !== productId);
    
    if (this.props.productIds.length !== initialLength) {
      this.props.updatedAt = new Date();
      return true;
    }
    
    return false;
  }

  /**
   * Add a category ID to this campaign
   */
  public addCategoryId(categoryId: string): void {
    if (!this.props.categoryIds) {
      this.props.categoryIds = [];
    }
    
    if (!this.props.categoryIds.includes(categoryId)) {
      this.props.categoryIds.push(categoryId);
      this.props.updatedAt = new Date();
    }
  }

  /**
   * Remove a category ID from this campaign
   */
  public removeCategoryId(categoryId: string): boolean {
    if (!this.props.categoryIds) {
      return false;
    }
    
    const initialLength = this.props.categoryIds.length;
    this.props.categoryIds = this.props.categoryIds.filter(id => id !== categoryId);
    
    if (this.props.categoryIds.length !== initialLength) {
      this.props.updatedAt = new Date();
      return true;
    }
    
    return false;
  }

  /**
   * Update the price modifier for this campaign
   */
  public updatePriceModifier(priceModifier: PriceModifier): void {
    this.props.priceModifier = priceModifier;
    this.props.updatedAt = new Date();
  }

  /**
   * Activate this campaign
   */
  public activate(): Result<void, string> {
    if (this.props.status === CampaignStatus.DRAFT || 
        this.props.status === CampaignStatus.SCHEDULED || 
        this.props.status === CampaignStatus.PAUSED) {
      
      const now = new Date();
      if (now > this.props.endDate) {
        return failure('Cannot activate a campaign that has already ended');
      }
      
      this.props.status = CampaignStatus.ACTIVE;
      this.props.updatedAt = now;
      return success(undefined);
    }
    
    return failure(`Cannot activate campaign with status ${this.props.status}`);
  }

  /**
   * Pause this campaign
   */
  public pause(): Result<void, string> {
    if (this.props.status === CampaignStatus.ACTIVE) {
      this.props.status = CampaignStatus.PAUSED;
      this.props.updatedAt = new Date();
      return success(undefined);
    }
    
    return failure(`Cannot pause campaign with status ${this.props.status}`);
  }

  /**
   * Complete this campaign
   */
  public complete(): Result<void, string> {
    if (this.props.status === CampaignStatus.ACTIVE || 
        this.props.status === CampaignStatus.PAUSED || 
        this.props.status === CampaignStatus.SCHEDULED) {
      
      this.props.status = CampaignStatus.COMPLETED;
      this.props.updatedAt = new Date();
      return success(undefined);
    }
    
    return failure(`Cannot complete campaign with status ${this.props.status}`);
  }

  /**
   * Cancel this campaign
   */
  public cancel(): Result<void, string> {
    if (this.props.status !== CampaignStatus.COMPLETED && 
        this.props.status !== CampaignStatus.CANCELLED) {
      
      this.props.status = CampaignStatus.CANCELLED;
      this.props.updatedAt = new Date();
      return success(undefined);
    }
    
    return failure(`Cannot cancel campaign with status ${this.props.status}`);
  }
}
