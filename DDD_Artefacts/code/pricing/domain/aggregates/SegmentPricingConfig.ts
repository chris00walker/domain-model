import { AggregateRoot } from '@shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { PricingTier, PricingTierType } from '../value-objects/PricingTier';
import { MarkupPercentage } from '../value-objects/MarkupPercentage';
import { DiscountPercentage } from '../value-objects/DiscountPercentage';
import { PricingStrategy } from '../strategies/PricingStrategy';

interface SegmentPricingConfigProps {
  pricingTier: PricingTier;
  baseMarkupPercentage: MarkupPercentage;
  maxDiscountPercentage: DiscountPercentage;
  floorGrossMarginPercentage: number;
  targetGrossMarginPercentage: number;
  defaultPricingStrategy: string; // ID of the default pricing strategy to use
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate that encapsulates pricing configuration for a specific customer segment
 */
export class SegmentPricingConfig extends AggregateRoot<SegmentPricingConfigProps> {
  get pricingTier(): PricingTier {
    return this.props.pricingTier;
  }

  get baseMarkupPercentage(): MarkupPercentage {
    return this.props.baseMarkupPercentage;
  }

  get maxDiscountPercentage(): DiscountPercentage {
    return this.props.maxDiscountPercentage;
  }

  get floorGrossMarginPercentage(): number {
    return this.props.floorGrossMarginPercentage;
  }

  get targetGrossMarginPercentage(): number {
    return this.props.targetGrossMarginPercentage;
  }

  get defaultPricingStrategy(): string {
    return this.props.defaultPricingStrategy;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: SegmentPricingConfigProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Create a new SegmentPricingConfig aggregate
   */
  public static create(
    props: SegmentPricingConfigProps,
    id?: UniqueEntityID
  ): Result<SegmentPricingConfig, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.pricingTier, argumentName: 'pricingTier' },
      { argument: props.baseMarkupPercentage, argumentName: 'baseMarkupPercentage' },
      { argument: props.maxDiscountPercentage, argumentName: 'maxDiscountPercentage' },
      { argument: props.floorGrossMarginPercentage, argumentName: 'floorGrossMarginPercentage' },
      { argument: props.targetGrossMarginPercentage, argumentName: 'targetGrossMarginPercentage' },
      { argument: props.defaultPricingStrategy, argumentName: 'defaultPricingStrategy' },
      { argument: props.isActive, argumentName: 'isActive' },
      { argument: props.createdAt, argumentName: 'createdAt' },
      { argument: props.updatedAt, argumentName: 'updatedAt' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.floorGrossMarginPercentage < 0 || props.floorGrossMarginPercentage > 200) {
      return failure('Floor gross margin percentage must be between 0 and 200');
    }

    if (props.targetGrossMarginPercentage < 0 || props.targetGrossMarginPercentage > 200) {
      return failure('Target gross margin percentage must be between 0 and 200');
    }

    if (props.targetGrossMarginPercentage < props.floorGrossMarginPercentage) {
      return failure('Target gross margin percentage must be greater than or equal to floor gross margin percentage');
    }

    return success(new SegmentPricingConfig(props, id));
  }

  /**
   * Create a default segment pricing config based on a pricing tier
   */
  public static createDefault(
    pricingTier: PricingTier,
    defaultPricingStrategyId: string,
    id?: UniqueEntityID
  ): Result<SegmentPricingConfig, string> {
    // Get default values from the tier
    const baseMarkup = pricingTier.getBaseMarkupPercentage();
    const maxDiscount = pricingTier.getMaxDiscountPercentage();
    const floorMargin = pricingTier.getFloorGrossMarginPercentage();
    const targetMargin = pricingTier.getTargetGrossMarginPercentage();

    // Create the markup percentage value object
    const markupResult = MarkupPercentage.create(baseMarkup);
    if (markupResult.isFailure()) {
      return failure(`Failed to create markup percentage: ${markupResult.error}`);
    }

    // Create the discount percentage value object
    const discountResult = DiscountPercentage.create(maxDiscount);
    if (discountResult.isFailure()) {
      return failure(`Failed to create discount percentage: ${discountResult.error}`);
    }

    const now = new Date();

    return SegmentPricingConfig.create(
      {
        pricingTier,
        baseMarkupPercentage: markupResult.value,
        maxDiscountPercentage: discountResult.value,
        floorGrossMarginPercentage: floorMargin,
        targetGrossMarginPercentage: targetMargin,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      id
    );
  }

  /**
   * Update the markup percentage
   */
  public updateMarkupPercentage(markupPercentage: MarkupPercentage): void {
    this.props.baseMarkupPercentage = markupPercentage;
    this.props.updatedAt = new Date();
  }

  /**
   * Update the maximum discount percentage
   */
  public updateMaxDiscountPercentage(discountPercentage: DiscountPercentage): void {
    this.props.maxDiscountPercentage = discountPercentage;
    this.props.updatedAt = new Date();
  }

  /**
   * Update the gross margin percentages
   */
  public updateMarginPercentages(
    floorGrossMarginPercentage: number,
    targetGrossMarginPercentage: number
  ): Result<void, string> {
    if (floorGrossMarginPercentage < 0 || floorGrossMarginPercentage > 100) {
      return failure('Floor gross margin percentage must be between 0 and 100');
    }

    if (targetGrossMarginPercentage < 0 || targetGrossMarginPercentage > 100) {
      return failure('Target gross margin percentage must be between 0 and 100');
    }

    if (targetGrossMarginPercentage < floorGrossMarginPercentage) {
      return failure('Target gross margin percentage must be greater than or equal to floor gross margin percentage');
    }

    this.props.floorGrossMarginPercentage = floorGrossMarginPercentage;
    this.props.targetGrossMarginPercentage = targetGrossMarginPercentage;
    this.props.updatedAt = new Date();

    return success(undefined);
  }

  /**
   * Update the default pricing strategy
   */
  public updateDefaultPricingStrategy(strategyId: string): void {
    this.props.defaultPricingStrategy = strategyId;
    this.props.updatedAt = new Date();
  }

  /**
   * Update the notes
   */
  public updateNotes(notes?: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  /**
   * Activate this segment pricing config
   */
  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivate this segment pricing config
   */
  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if this config is valid for a given pricing tier
   */
  public isValidForTier(pricingTier: PricingTier): boolean {
    return this.props.pricingTier.equals(pricingTier);
  }
}
