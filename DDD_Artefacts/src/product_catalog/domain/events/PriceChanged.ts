import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { Money } from '../../../shared/domain/value-objects/Money';

// Using an interface to break circular dependency
interface ProductPrice {
  id: string;
  price: Money;
}

export class PriceChanged extends DomainEvent {
  private readonly productId: string;
  private readonly previousPrice: Money;
  private readonly newPrice: Money;

  constructor(product: ProductPrice, previousPrice: Money) {
    super({
      aggregateId: product.id,
      eventId: undefined,
      occurredOn: undefined,
    });
    this.productId = product.id;
    this.previousPrice = previousPrice;
    this.newPrice = product.price;
  }

  toPrimitives(): any {
    return {
      aggregateId: this.aggregateId,
      productId: this.productId,
      previousPrice: this.previousPrice.toObject(),
      newPrice: this.newPrice.toObject(),
      occurredOn: this.occurredOn
    };
  }
}
