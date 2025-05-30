import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { Subscription } from '../aggregates/Subscription';

export class SubscriptionRenewed extends DomainEvent {
  public readonly subscription: Subscription;

  constructor(subscription: Subscription) {
    super({
      aggregateId: subscription.subscriptionId
    });
    this.subscription = subscription;
  }

  public toPrimitives(): any {
    return {
      subscriptionId: this.subscription.subscriptionId,
      customerId: this.subscription.customerId,
      renewedAt: new Date().toISOString(),
      newEndDate: this.subscription.endDate?.toISOString()
    };
  }

  public static fromPrimitives(
    aggregateId: string,
    payload: { 
      subscriptionId: string;
      customerId: string;
      renewedAt: string;
      newEndDate?: string;
    },
    occurredOn: Date
  ): SubscriptionRenewed {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn,
    };
    // We'd need a way to reconstruct the Subscription object, but for now we'll use null
    return new SubscriptionRenewed(null as any);
  }
}
