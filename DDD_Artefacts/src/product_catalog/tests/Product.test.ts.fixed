import { Product } from '../domain/aggregates/Product';
import { Money } from '../../shared/domain/value-objects/Money';
import { TestClock } from '../../shared/domain/Clock';
import { ProductCreated, InventoryAdjusted, PriceChanged } from '../domain/events';

describe('Product Aggregate with Clock', () => {
  const createValidProductProps = () => {
    const moneyResult = Money.create(15.99, 'BBD');
    expect(moneyResult.isSuccess()).toBeTruthy();
    
    return {
      name: 'Imported Olive Oil',
      description: 'Premium olive oil from Spain',
      price: moneyResult.isSuccess() ? moneyResult.value : {} as Money,
      inventoryCount: 100,
      isDiscontinued: false,
      categoryIds: ['oils', 'imported']
    };
  };

  const initialDate = new Date('2025-05-20T10:00:00Z');

  it('should set createdAt and updatedAt using the provided clock', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProductProps();
    
    // Act
    const productResult = Product.create(props, undefined, testClock);
    
    // Assert
    expect(productResult.isSuccess()).toBeTruthy();
    if (!productResult.isSuccess()) return;
    const product = productResult.value;
    
    expect(product.createdAt.getTime()).toBe(initialDate.getTime());
    expect(product.updatedAt.getTime()).toBe(initialDate.getTime());
  });
  
  it('should emit ProductCreated event when creating a product', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProductProps();
    
    // Act
    const productResult = Product.create(props, undefined, testClock);
    
    // Assert
    expect(productResult.isSuccess()).toBeTruthy();
    if (!productResult.isSuccess()) return;
    const product = productResult.value;
    const events = product.domainEvents;
    
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(ProductCreated);
    const createdEvent = events[0] as ProductCreated;
    
    // We verify the event contains a reference to the product
    // using the product ID since the property might be private
    expect(createdEvent.aggregateId.toString() === product.getId().toString()).toBeTruthy();
  });
  
  it('should update the updatedAt timestamp when adjusting inventory', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProductProps();
    const productResult = Product.create(props, undefined, testClock);
    expect(productResult.isSuccess()).toBeTruthy();
    if (!productResult.isSuccess()) return;
    const product = productResult.value;
    
    // Clear initial events
    product.clearEvents();
    
    // Advance clock
    const updateTime = new Date('2025-05-20T12:30:00Z');
    testClock.setCurrentTime(updateTime);
    
    // Record the initial inventory count
    const initialCount = product.inventoryCount;
    
    // Act
    const result = product.adjustInventory(-10, testClock);
    
    // Assert
    expect(result.isSuccess()).toBeTruthy();
    expect(product.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(product.inventoryCount).toBe(initialCount - 10);
    
    // Check event
    const events = product.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(InventoryAdjusted);
    
    // Verifying the event was created for this aggregate
    const inventoryEvent = events[0] as InventoryAdjusted;
    expect(inventoryEvent.aggregateId.toString() === product.getId().toString()).toBeTruthy();
  });
  
  it('should update the updatedAt timestamp when changing price', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProductProps();
    const productResult = Product.create(props, undefined, testClock);
    expect(productResult.isSuccess()).toBeTruthy();
    if (!productResult.isSuccess()) return;
    const product = productResult.value;
    
    // Clear initial events
    product.clearEvents();
    
    // Advance clock
    const updateTime = new Date('2025-05-20T15:45:00Z');
    testClock.setCurrentTime(updateTime);
    
    // Create new price
    const newPriceResult = Money.create(19.99, 'BBD');
    expect(newPriceResult.isSuccess()).toBeTruthy();
    if (!newPriceResult.isSuccess()) return;
    const newPrice = newPriceResult.value;
    
    // Keep track of original price for comparison
    const originalPrice = product.price;
    
    // Act
    const result = product.changePrice(newPrice, testClock);
    
    // Assert
    expect(result.isSuccess()).toBeTruthy();
    expect(product.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(product.price.equals(newPrice)).toBeTruthy();
    
    // Check event
    const events = product.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(PriceChanged);
    
    // Verifying the event was created for this aggregate
    const priceEvent = events[0] as PriceChanged;
    expect(priceEvent.aggregateId.toString() === product.getId().toString()).toBeTruthy();
  });
  
  it('should update the updatedAt timestamp when discontinuing a product', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProductProps();
    const productResult = Product.create(props, undefined, testClock);
    expect(productResult.isSuccess()).toBeTruthy();
    if (!productResult.isSuccess()) return;
    const product = productResult.value;
    
    // Advance clock
    const updateTime = new Date('2025-05-21T09:15:00Z');
    testClock.setCurrentTime(updateTime);
    
    // Act
    const result = product.discontinue(testClock);
    
    // Assert
    expect(result.isSuccess()).toBeTruthy();
    expect(product.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(product.isDiscontinued).toBeTruthy();
  });
  
  it('should update the updatedAt timestamp when reactivating a product', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = {
      ...createValidProductProps(),
      isDiscontinued: true
    };
    const productResult = Product.create(props, undefined, testClock);
    expect(productResult.isSuccess()).toBeTruthy();
    if (!productResult.isSuccess()) return;
    const product = productResult.value;
    
    // Advance clock
    const updateTime = new Date('2025-05-22T14:20:00Z');
    testClock.setCurrentTime(updateTime);
    
    // Act
    const result = product.reactivate(testClock);
    
    // Assert
    expect(result.isSuccess()).toBeTruthy();
    expect(product.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(product.isDiscontinued).toBeFalsy();
  });
});
