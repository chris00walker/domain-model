import { ExpatCustomer } from '@customers/domain/aggregates/ExpatCustomer';
import { FoodTruckCustomer } from '@customers/domain/aggregates/FoodTruckCustomer';
import { CustomerSegment } from '@customers/domain/value-objects/CustomerSegment';
import { CustomerSegmentType } from '@customers/domain/value-objects/CustomerSegmentType';
import { CustomerType } from '@customers/domain/value-objects/CustomerType';
import { B2CCustomerSegment } from '@customers/domain/value-objects/B2CCustomerSegment';
import { B2BCustomerSegment } from '@customers/domain/value-objects/B2BCustomerSegment';
import { ContactInfo } from '@customers/domain/value-objects/ContactInfo';
import { Address } from '@shared/domain/value-objects/Address';
import { success, failure, Result } from '@shared/core/Result';
import { CustomerSegmentChanged } from '@customers/domain/events/CustomerSegmentChanged';

class InMemoryCustomerRepository {
  private store = new Map<string, any>();

  async findById(id: string): Promise<Result<any>> {
    const customer = this.store.get(id);
    return customer ? success(customer) : failure('not found');
  }

  async save(customer: any): Promise<Result<void>> {
    if (this.store.has(customer.id)) {
      return failure('duplicate');
    }
    this.store.set(customer.id, customer);
    return success(undefined);
  }
}

const createContactInfo = () => {
  const res = ContactInfo.create({
    email: 'test@example.com',
    phone: '+1234567890',
    preferredContactMethod: 'EMAIL'
  });
  if (res.isFailure()) throw new Error();
  return res.value;
};

const createB2CSegment = () => {
  const base = CustomerSegment.create({
    segmentType: CustomerSegmentType.ExpatNewArrival,
    customerType: CustomerType.Expat,
    acquisitionDate: new Date('2025-01-01'),
    acquisitionChannel: 'Web',
    lifetimeValue: 100,
    engagementScore: 50
  });
  if (base.isFailure()) throw new Error();
  const seg = B2CCustomerSegment.create({
    customerSegment: base.value,
    culturalPreferences: ['Asian'],
    purchaseFrequency: 1,
    averageOrderValue: 25,
    loyaltyPoints: 0,
    referralCount: 0
  });
  if (seg.isFailure()) throw new Error();
  return { base: base.value, b2c: seg.value };
};

const createB2BSegment = () => {
  const base = CustomerSegment.create({
    segmentType: CustomerSegmentType.FoodTruckStartup,
    customerType: CustomerType.FoodTruck,
    acquisitionDate: new Date('2025-01-01'),
    acquisitionChannel: 'Expo',
    lifetimeValue: 5000,
    engagementScore: 70
  });
  if (base.isFailure()) throw new Error();
  const seg = B2BCustomerSegment.create({
    customerSegment: base.value,
    businessSize: 'SMALL',
    annualRevenue: 100000,
    employeeCount: 10,
    orderVolume: 50,
    paymentTerms: 30,
    specialPricing: false
  });
  if (seg.isFailure()) throw new Error();
  return { base: base.value, b2b: seg.value };
};

// Scenario 1
describe('Customer aggregate', () => {
  test('Customer.create valid', () => {
    // Arrange
    const contactInfo = createContactInfo();
    const { base, b2c } = createB2CSegment();

    // Act
    const result = ExpatCustomer.create({
      name: 'John Doe',
      contactInfo,
      countryOfOrigin: 'USA',
      residencyStatus: 'PERMANENT',
      residenceDuration: 12,
      hasSubscription: false,
      customerSegment: base,
      b2cSegment: b2c
    });

    // Assert
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.b2cSegment).toBeDefined();
    }
  });

  test('duplicate ID', async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const contactInfo = createContactInfo();
    const { base, b2c } = createB2CSegment();
    const res = ExpatCustomer.create({
      name: 'Dup',
      contactInfo,
      countryOfOrigin: 'USA',
      residencyStatus: 'PERMANENT',
      residenceDuration: 12,
      hasSubscription: false,
      customerSegment: base,
      b2cSegment: b2c
    });
    if (res.isFailure()) throw new Error();
    const customer = res.value;

    // Act
    const first = await repo.save(customer);
    const second = await repo.save(customer);

    // Assert
    expect(first.isSuccess()).toBe(true);
    expect(second.isFailure()).toBe(true);
    if (second.isFailure()) {
      expect(second.error).toBe('duplicate');
    }
  });

  test('updating B2B segment on B2C customer', () => {
    // Arrange
    const contactInfo = createContactInfo();
    const { base, b2c } = createB2CSegment();
    const custRes = ExpatCustomer.create({
      name: 'Jane',
      contactInfo,
      countryOfOrigin: 'USA',
      residencyStatus: 'PERMANENT',
      residenceDuration: 12,
      hasSubscription: false,
      customerSegment: base,
      b2cSegment: b2c
    });
    if (custRes.isFailure()) throw new Error();
    const customer = custRes.value;
    const { base: b2bBase, b2b } = createB2BSegment();

    // Act
    const result = customer.updateB2BSegment(b2b);

    // Assert
    expect(result.isFailure()).toBe(true);
  });

  test('valid segment change B2C→B2B', () => {
    // Arrange
    const contactInfo = createContactInfo();
    const { base: startSeg } = createB2BSegment();
    const addrRes = Address.create({
      street: '123 Main',
      city: 'Town',
      state: 'CA',
      postalCode: '90210',
      country: 'US'
    });
    if (addrRes.isFailure()) throw new Error();
    const props = {
      name: 'Truck',
      contactInfo,
      businessName: 'Tasty',
      taxId: 'TAX123',
      businessLicenseNumber: 'LIC456',
      cuisineType: ['BBQ'],
      operatingLocations: [addrRes.value],
      storageCapacity: 'SMALL' as const,
      creditTerms: 'NET_30' as const,
      customerSegment: startSeg
    };
    const custRes = FoodTruckCustomer.create(props);
    if (custRes.isFailure()) throw new Error(custRes.error);
    const customer = custRes.value;
    customer.clearEvents();
    const { base: newSeg } = createB2BSegment();

    // Act
    const result = customer.updateSegment(newSeg);

    // Assert
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(customer.domainEvents.some(e => e instanceof CustomerSegmentChanged)).toBe(true);
    }
  });
});
