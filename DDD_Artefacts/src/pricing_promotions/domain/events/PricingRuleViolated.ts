import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { PricingRule } from '../entities/PricingRule';

export class PricingRuleViolated extends DomainEvent {
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
    super({
      aggregateId: rule.id.toString(),
      occurredOn: new Date()
    });
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

  toPrimitives(): any {
    return {
      rule: (this.rule as any).toPrimitives ? (this.rule as any).toPrimitives() : { id: this.rule.id.toString() },
      violationContext: this.violationContext,
      message: this.message,
      severity: this.severity,
      orderId: this.orderId,
      productId: this.productId,
      userId: this.userId,
      dateTimeOccurred: this.dateTimeOccurred.toISOString()
    };
  }
}
