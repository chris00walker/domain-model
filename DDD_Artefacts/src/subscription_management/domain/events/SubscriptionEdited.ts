import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { Subscription } from '../aggregates/Subscription';

export class SubscriptionEdited extends DomainEvent {
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
      editedAt: new Date().toISOString(),
      items: this.subscription.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };
  }

  public static fromPrimitives(
    aggregateId: string,
    payload: { 
      subscriptionId: string;
      customerId: string;
      editedAt: string;
      items: Array<{
        productId: string;
        quantity: number;
      }>;
    },
    occurredOn: Date
  ): SubscriptionEdited {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn,
    };
    // We'd need a way to reconstruct the Subscription object, but for now we'll use null
    return new SubscriptionEdited(null as any);
  }
}
