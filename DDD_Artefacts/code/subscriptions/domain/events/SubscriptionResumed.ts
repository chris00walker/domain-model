import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { Subscription } from '../aggregates/Subscription';

export class SubscriptionResumed extends DomainEvent {
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
      resumedAt: new Date().toISOString(),
      nextDeliveryDate: this.subscription.nextDeliveryDate?.toISOString()
    };
  }

  public static fromPrimitives(
    aggregateId: string,
    payload: { 
      subscriptionId: string;
      customerId: string;
      resumedAt: string;
      nextDeliveryDate?: string;
    },
    occurredOn: Date
  ): SubscriptionResumed {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn,
    };
    // We'd need a way to reconstruct the Subscription object, but for now we'll use null
    return new SubscriptionResumed(null as any);
  }
}
