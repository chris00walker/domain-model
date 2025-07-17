import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Order } from '../aggregates/Order';

export class OrderCreated extends DomainEvent {
  public static readonly EVENT_NAME = 'order.created';
  
  public readonly order: Order;

  constructor(order: Order) {
    super({
      aggregateId: order.id,
      eventId: new UniqueEntityID().toString(),
      occurredOn: new Date()
    });
    this.order = order;
  }

  public toPrimitives(): any {
    const totalResult = this.order.calculateTotal();
    if (totalResult.isFailure()) {
      throw new Error(`Failed to calculate order total: ${totalResult.error}`);
    }
    
    const total = totalResult.value;
    return {
      orderId: this.aggregateId,
      customerId: this.order.customerId.toString(),
      amount: total.amount,
      currency: total.currency,
      itemCount: this.order.items.length,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): OrderCreated {
    throw new Error('Method not implemented. Use OrderCreated constructor directly.');
  }
}
