import { Entity } from '@shared/domain/base/Entity';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { PricingTier } from '../value-objects/PricingTier';
import { PriceModifier } from '../value-objects/PriceModifier';

export enum RuleConditionType {
  CUSTOMER_SEGMENT = 'CUSTOMER_SEGMENT',
  PRODUCT_CATEGORY = 'PRODUCT_CATEGORY',
  MINIMUM_QUANTITY = 'MINIMUM_QUANTITY',
  MINIMUM_SPEND = 'MINIMUM_SPEND',
  TIME_BASED = 'TIME_BASED',
  BUNDLE = 'BUNDLE',
  LOCATION = 'LOCATION',
  FIRST_PURCHASE = 'FIRST_PURCHASE'
}

interface RuleCondition {
  type: RuleConditionType;
  value: string | number | string[];
  operator?: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'NOT_CONTAINS';
}

interface PricingRuleProps {
  name: string;
  description: string;
  conditions: RuleCondition[];
  priceModifier: PriceModifier;
  applicableTiers: PricingTier[];
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PricingRule extends Entity<PricingRuleProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get conditions(): RuleCondition[] {
    return [...this.props.conditions]; // Return copy to maintain immutability
  }

  get priceModifier(): PriceModifier {
    return this.props.priceModifier;
  }

  get applicableTiers(): PricingTier[] {
    return [...this.props.applicableTiers]; // Return copy to maintain immutability
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get priority(): number {
    return this.props.priority;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: PricingRuleProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: PricingRuleProps, id?: UniqueEntityID): Result<PricingRule, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.description, argumentName: 'description' },
      { argument: props.conditions, argumentName: 'conditions' },
      { argument: props.priceModifier, argumentName: 'priceModifier' },
      { argument: props.applicableTiers, argumentName: 'applicableTiers' },
      { argument: props.isActive, argumentName: 'isActive' },
      { argument: props.priority, argumentName: 'priority' },
      { argument: props.createdAt, argumentName: 'createdAt' },
      { argument: props.updatedAt, argumentName: 'updatedAt' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.conditions.length === 0) {
      return failure('Pricing rule must have at least one condition');
    }

    if (props.applicableTiers.length === 0) {
      return failure('Pricing rule must apply to at least one pricing tier');
    }

    if (props.startDate && props.endDate && props.startDate > props.endDate) {
      return failure('Start date must be before end date');
    }

    return success(new PricingRule(props, id));
  }

  public isApplicableTo(pricingTier: PricingTier): boolean {
    return this.props.applicableTiers.some(tier => tier.equals(pricingTier));
  }

  /**
   * Determines if this rule is currently active based on dates and active status
   */
  public isCurrentlyActive(): boolean {
    if (!this.props.isActive) {
      return false;
    }

    const now = new Date();
    
    if (this.props.startDate && now < this.props.startDate) {
      return false;
    }

    if (this.props.endDate && now > this.props.endDate) {
      return false;
    }

    return true;
  }

  /**
   * Evaluates if the rule conditions match the given context
   * @param context The context to evaluate against the rule conditions
   */
  public matchesConditions(context: Record<string, any>): boolean {
    // Every condition must match
    return this.props.conditions.every(condition => {
      const contextValue = context[condition.type];
      
      if (contextValue === undefined) {
        return false;
      }

      switch (condition.operator) {
        case 'EQUALS':
          return contextValue === condition.value;
        case 'NOT_EQUALS':
          return contextValue !== condition.value;
        case 'GREATER_THAN':
          return contextValue > condition.value;
        case 'LESS_THAN':
          return contextValue < condition.value;
        case 'CONTAINS':
          if (Array.isArray(contextValue)) {
            return Array.isArray(condition.value) 
              ? condition.value.some(v => contextValue.includes(v))
              : contextValue.includes(condition.value);
          }
          return false;
        case 'NOT_CONTAINS':
          if (Array.isArray(contextValue)) {
            return Array.isArray(condition.value) 
              ? !condition.value.some(v => contextValue.includes(v))
              : !contextValue.includes(condition.value);
          }
          return false;
        default:
          // Default to equality check
          return contextValue === condition.value;
      }
    });
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public updateDateRange(startDate?: Date, endDate?: Date): Result<void, string> {
    if (startDate && endDate && startDate > endDate) {
      return failure('Start date must be before end date');
    }

    this.props.startDate = startDate;
    this.props.endDate = endDate;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }

  public updatePriority(priority: number): void {
    this.props.priority = priority;
    this.props.updatedAt = new Date();
  }
}
