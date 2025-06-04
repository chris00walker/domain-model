import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { PricingRule } from '../entities/PricingRule';

export class PricingRuleViolated implements DomainEvent {
  public dateTimeOccurred: Date;
  public rule: PricingRule;
  public violationContext: Record<string, any>;
  public message: string;
  public severity: 'INFO' | 'WARNING' | 'ERROR';
  public orderId?: string;
  public productId?: string;
  public userId?: string;

  constructor(
    rule: PricingRule,
    violationContext: Record<string, any>,
    message: string,
    severity: 'INFO' | 'WARNING' | 'ERROR' = 'WARNING',
    orderId?: string,
    productId?: string,
    userId?: string
  ) {
    this.dateTimeOccurred = new Date();
    this.rule = rule;
    this.violationContext = violationContext;
    this.message = message;
    this.severity = severity;
    this.orderId = orderId;
    this.productId = productId;
    this.userId = userId;
  }

  getAggregateId(): UniqueEntityID {
    return this.rule.id;
  }
}
