import { Order, OrderProps } from '@ordering/domain/aggregates/Order';
import { OrderItem } from '@ordering/domain/value-objects/OrderItem';
import { OrderStatus } from '@ordering/domain/value-objects/OrderStatus';
import { CustomerId } from '@customers/domain/value-objects/CustomerId';
import { ProductId } from '@catalog/domain/value-objects/ProductId';
import { Money } from '@shared/domain/value-objects/Money';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

describe('Order', () => {
  const customerId = (() => {
    const result = CustomerId.create('customer-123');
    if (result.isFailure()) {
      throw new Error('Failed to create customer ID: ' + result.error);
    }
    return result.value;
  })();
  const orderId = 'order-123';
  const shippingAddress = '123 Main St, Bridgetown, Barbados';
  const billingAddress = '123 Main St, Bridgetown, Barbados';
  
  const createOrderItem = (price: number, quantity: number): OrderItem => {
    const moneyResult = Money.create(price, 'BBD');
    if (moneyResult.isFailure()) {
      throw new Error('Failed to create money: ' + moneyResult.error);
    }

    const productIdResult = ProductId.create(`product-${Math.random().toString(36).substr(2, 9)}`);
    if (productIdResult.isFailure()) {
      throw new Error('Failed to create product ID: ' + productIdResult.error);
    }

    const itemProps = {
      productId: productIdResult.value,
      name: 'Test Product',
      price: moneyResult.value,
      quantity,
      sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
    
    const itemResult = OrderItem.create(itemProps);
    if (itemResult.isFailure()) {
      throw new Error('Failed to create order item: ' + itemResult.error);
    }
    return itemResult.value;
  };

  const createOrder = (items: OrderItem[] = [], id?: string): Order => {
    const orderProps: OrderProps = {
      customerId,
      items,
      status: OrderStatus.Created,
      shippingAddress,
      billingAddress,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderResult = Order.create(orderProps, id ? new UniqueEntityID(id) : undefined);
    if (orderResult.isFailure()) {
      throw new Error('Failed to create order');
    }
    return orderResult.value;
  };

  describe('creation', () => {
    it('should create an order with initial status as Created', () => {
      const order = createOrder([]);
      expect(order.status).toBe(OrderStatus.Created);
    });

    it('should generate an ID if not provided', () => {
      const order = createOrder([]);
      expect(order.id).toBeDefined();
    });

    it('should use provided ID if specified', () => {
      const order = createOrder([], orderId);
      expect(order.id).toBe(orderId);
    });
  });

  describe('adding items', () => {
    it('should add an item to the order', () => {
      const order = createOrder([]);
      const item = createOrderItem(100, 2);
      
      const result = order.addItem(item);
      
      expect(result.isSuccess()).toBe(true);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].equals(item)).toBe(true);
    });

    it('should not add duplicate items', () => {
      const item = createOrderItem(100, 1);
      const order = createOrder([item]);
      
      const result = order.addItem(item);
      
      expect(result.isFailure()).toBe(true);
      expect(order.items).toHaveLength(1);
    });
  });

  describe('removing items', () => {
    it('should remove an item from the order', () => {
      const item = createOrderItem(100, 1);
      const order = createOrder([item]);
      
      const result = order.removeItem(item.productId.toString());
      
      expect(result.isSuccess()).toBe(true);
      expect(order.items).toHaveLength(0);
    });

    it('should fail when removing non-existent item', () => {
      const order = createOrder([]);
      
      const result = order.removeItem('non-existent-id');
      
      expect(result.isFailure()).toBe(true);
    });
  });

  describe('calculating total', () => {
    it('should calculate total for empty order', () => {
      const order = createOrder([]);
      const result = order.calculateTotal();
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const total = result.value;
        expect(total.amount).toBe(0);
        expect(total.currency).toBe('BBD');
      }
    });

    it('should calculate total for order with multiple items', () => {
      const items = [
        createOrderItem(100, 2), // 200
        createOrderItem(50, 3)   // 150
      ];
      const order = createOrder(items);
      
      const result = order.calculateTotal();
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.amount).toBe(350);
      }
    });
  });

  describe('order status transitions', () => {
    it('should transition from Created to Paid', () => {
      const order = createOrder([]);
      
      const result = order.confirmPayment();
      
      expect(result.isSuccess()).toBe(true);
      expect(order.status).toBe(OrderStatus.Paid);
    });

    it('should transition from Paid to Fulfilled', () => {
      const order = createOrder([]);
      order.confirmPayment();
      
      const result = order.fulfill();
      
      expect(result.isSuccess()).toBe(true);
      expect(order.status).toBe(OrderStatus.Fulfilled);
    });

    it('should not allow invalid transitions', () => {
      const order = createOrder([]);
      
      // Try to fulfill without paying
      const result = order.fulfill();
      
      expect(result.isFailure()).toBe(true);
      expect(order.status).toBe(OrderStatus.Created);
    });
  });

  describe('cancellation', () => {
    it('should cancel an order in Created state', () => {
      const order = createOrder([]);
      
      const result = order.cancel('Customer request');
      
      expect(result.isSuccess()).toBe(true);
      expect(order.status).toBe(OrderStatus.Cancelled);
    });

    it('should not cancel a fulfilled order', () => {
      const order = createOrder([]);
      order.confirmPayment();
      order.fulfill();
      
      const result = order.cancel('Too late');
      
      expect(result.isFailure()).toBe(true);
      expect(order.status).toBe(OrderStatus.Fulfilled);
    });
  });

  describe('domain events', () => {
    it('should add OrderCreated event when order is created', () => {
      const order = createOrder([]);
      
      const events = order.domainEvents;
      
      expect(events).toHaveLength(1);
      expect(events[0].constructor.name).toBe('OrderCreated');
    });
  });
});
