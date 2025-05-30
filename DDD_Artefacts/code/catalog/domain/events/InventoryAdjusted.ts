import { DomainEvent } from '@shared/domain/events/DomainEvent';

// Using an interface to break circular dependency
interface ProductInventory {
  id: string;
  inventoryCount: number;
}

export class InventoryAdjusted extends DomainEvent {
  private readonly productId: string;
  private readonly previousCount: number;
  private readonly newCount: number;
  private readonly delta: number;

  constructor(product: ProductInventory, previousCount: number, delta: number) {
    super({
      aggregateId: product.id,
      eventId: undefined,
      occurredOn: undefined,
    });
    this.productId = product.id;
    this.previousCount = previousCount;
    this.newCount = previousCount + delta;
    this.delta = delta;
  }

  toPrimitives(): any {
    return {
      aggregateId: this.aggregateId,
      productId: this.productId,
      previousCount: this.previousCount,
      newCount: this.newCount,
      delta: this.delta,
      occurredOn: this.occurredOn
    };
  }
}
