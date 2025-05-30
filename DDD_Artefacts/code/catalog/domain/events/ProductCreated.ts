import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { Money } from '@shared/domain/value-objects/Money';

// Using an interface to break circular dependency
interface ProductSnapshot {
  id: string;
  name: string;
  description: string;
  price: Money;
  inventoryCount: number;
}

export class ProductCreated extends DomainEvent {
  private readonly productSnapshot: ProductSnapshot;

  constructor(product: ProductSnapshot) {
    super({
      aggregateId: product.id,
      eventId: undefined,
      occurredOn: undefined,
    });
    this.productSnapshot = product;
  }

  toPrimitives(): any {
    return {
      aggregateId: this.aggregateId,
      productId: this.productSnapshot.id,
      name: this.productSnapshot.name,
      description: this.productSnapshot.description,
      price: this.productSnapshot.price.toObject(),
      inventoryCount: this.productSnapshot.inventoryCount,
      occurredOn: this.occurredOn
    };
  }
}
