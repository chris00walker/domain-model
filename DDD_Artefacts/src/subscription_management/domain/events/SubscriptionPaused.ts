import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Subscription } from '../aggregates/Subscription';

export class SubscriptionPaused extends DomainEvent {
  public readonly subscription: Subscription;

  constructor(subscription: Subscription) {
    super({
      aggregateId: subscription.id.toString(),
      eventId: new UniqueEntityID().toString(),
      occurredOn: new Date()
    });
    this.subscription = subscription;
  }

  public toPrimitives(): any {
    return {
      subscriptionId: this.subscription.id.toString(),
      customerId: this.subscription.customerId,
      pausedAt: new Date().toISOString()
    };
  }

  public static fromPrimitives(
    aggregateId: string,
    payload: { 
      subscriptionId: string;
      customerId: string;
      pausedAt: string;
    },
    occurredOn: Date
  ): SubscriptionPaused {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn,
    };
    // We'd need a way to reconstruct the Subscription object, but for now we'll use null
    return new SubscriptionPaused(null as any);
  }
}
