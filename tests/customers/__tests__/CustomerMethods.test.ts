import { ExpatCustomer } from '../../../DDD_Artefacts/src/customer_management/domain/aggregates/ExpatCustomer';
import { FoodTruckCustomer } from '../../../DDD_Artefacts/src/customer_management/domain/aggregates/FoodTruckCustomer';
import { CustomerSegment } from '../../../DDD_Artefacts/src/customer_management/domain/value-objects/CustomerSegment';
import { CustomerSegmentType } from '../../../DDD_Artefacts/src/customer_management/domain/value-objects/CustomerSegmentType';
import { CustomerType } from '../../../DDD_Artefacts/src/customer_management/domain/value-objects/CustomerType';
import { B2CCustomerSegment } from '../../../DDD_Artefacts/src/customer_management/domain/value-objects/B2CCustomerSegment';
import { B2BCustomerSegment } from '../../../DDD_Artefacts/src/customer_management/domain/value-objects/B2BCustomerSegment';
import { ContactInfo } from '../../../DDD_Artefacts/src/customer_management/domain/value-objects/ContactInfo';
import { Address } from '../../../DDD_Artefacts/src/shared/domain/value-objects/Address';
import { CustomerUpdated } from '../../../DDD_Artefacts/src/customer_management/domain/events/CustomerUpdated';
import { CustomerSegmentChanged } from '../../../DDD_Artefacts/src/customer_management/domain/events/CustomerSegmentChanged';

const createContactInfo = (email = 'test@example.com') => {
  const res = ContactInfo.create({
    email,
    phone: '+1234567890',
    preferredContactMethod: 'EMAIL'
  });
  if (res.isFailure()) throw new Error(res.error);
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
  if (base.isFailure()) throw new Error(base.error);
  const seg = B2CCustomerSegment.create({
    customerSegment: base.value,
    culturalPreferences: ['Asian'],
    purchaseFrequency: 1,
    averageOrderValue: 25,
    loyaltyPoints: 0,
    referralCount: 0
  });
  if (seg.isFailure()) throw new Error(seg.error);
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
  if (base.isFailure()) throw new Error(base.error);
  const seg = B2BCustomerSegment.create({
    customerSegment: base.value,
    businessSize: 'SMALL',
    annualRevenue: 100000,
    employeeCount: 10,
    orderVolume: 50,
    paymentTerms: 30,
    specialPricing: false
  });
  if (seg.isFailure()) throw new Error(seg.error);
  return { base: base.value, b2b: seg.value };
};

const createAddress = () => {
  const addrRes = Address.create({
    street: '123 Main',
    city: 'Town',
    state: 'CA',
    postalCode: '90210',
    country: 'US'
  });
  if (addrRes.isFailure()) throw new Error(addrRes.error);
  return addrRes.value;
};

describe('Customer aggregate methods', () => {
  test('update contact info and addresses emit events', () => {
    const { base, b2c } = createB2CSegment();
    const contactInfo = createContactInfo();
    const result = ExpatCustomer.create({
      name: 'John',
      contactInfo,
      countryOfOrigin: 'USA',
      residencyStatus: 'PERMANENT',
      residenceDuration: 12,
      hasSubscription: false,
      customerSegment: base,
      b2cSegment: b2c
    });
    if (result.isFailure()) throw new Error(result.error);
    const customer = result.value;
    customer.clearEvents();
    expect(customer.createdAt instanceof Date).toBe(true);
    expect(customer.updatedAt instanceof Date).toBe(true);
    const newInfo = createContactInfo('new@example.com');

    const ship = createAddress();
    const bill = createAddress();

    const cRes = customer.updateContactInfo(newInfo);
    const sRes = customer.updateDefaultShippingAddress(ship);
    const bRes = customer.updateDefaultBillingAddress(bill);

    expect(cRes.isSuccess()).toBe(true);
    expect(sRes.isSuccess()).toBe(true);
    expect(bRes.isSuccess()).toBe(true);
    expect(customer.contactInfo.email).toBe('new@example.com');
    expect(customer.name).toBe('John');
    expect(customer.type).toBe(CustomerType.Expat);
    expect(customer.b2cSegment).toBeDefined();
    expect(customer.b2bSegment).toBeUndefined();
    // access various getters to increase coverage
    expect(customer.defaultShippingAddress).toBe(ship);
    expect(customer.defaultBillingAddress).toBe(bill);
    expect(customer.segmentType).toBe(base.segmentType);
    expect(customer.customerSegment).toBe(base);
    expect(typeof customer.customerId.value).toBe('string');
    expect(customer.domainEvents.filter(e => e instanceof CustomerUpdated).length).toBe(3);
  });

  test('segment compatibility failure', () => {
    const { base, b2c } = createB2CSegment();
    const contactInfo = createContactInfo();
    const res = ExpatCustomer.create({
      name: 'Mismatch',
      contactInfo,
      countryOfOrigin: 'US',
      residencyStatus: 'PERMANENT',
      residenceDuration: 12,
      hasSubscription: false,
      customerSegment: base,
      b2cSegment: b2c
    });
    if (res.isFailure()) throw new Error();
    const customer = res.value;
    const { base: wrongSeg } = createB2BSegment();
    const upd = customer.updateSegment(wrongSeg);
    expect(upd.isFailure()).toBe(true);
  });

  test('update B2C and B2B segments succeed for correct types', () => {
    const contactInfo = createContactInfo();
    const { base, b2c } = createB2CSegment();
    const expRes = ExpatCustomer.create({
      name: 'John',
      contactInfo,
      countryOfOrigin: 'USA',
      residencyStatus: 'PERMANENT',
      residenceDuration: 12,
      hasSubscription: false,
      customerSegment: base,
      b2cSegment: b2c
    });
    if (expRes.isFailure()) throw new Error();
    const exp = expRes.value;
    exp.clearEvents();
    const { b2c: newB2c } = createB2CSegment();
    const cRes = exp.updateB2CSegment(newB2c);
    expect(cRes.isSuccess()).toBe(true);

    const addr = createAddress();
    const { base: b2bBase, b2b } = createB2BSegment();
    const truckRes = FoodTruckCustomer.create({
      name: 'Truck',
      contactInfo,
      businessName: 'Tasty',
      taxId: 'TAX123',
      businessLicenseNumber: 'LIC456',
      cuisineType: ['BBQ'],
      operatingLocations: [addr],
      storageCapacity: 'SMALL',
      creditTerms: 'NET_30',
      customerSegment: b2bBase,
      b2bSegment: b2b
    });
    if (truckRes.isFailure()) throw new Error(truckRes.error);
    const truck = truckRes.value;
    truck.clearEvents();
    const { b2b: newB2b } = createB2BSegment();
    const bRes = truck.updateB2BSegment(newB2b);
    expect(bRes.isSuccess()).toBe(true);
    expect(truck.domainEvents.some(e => e instanceof CustomerUpdated)).toBe(true);
  });

  test('type helpers', () => {
    const contactInfo = createContactInfo();
    const { base, b2c } = createB2CSegment();
    const expRes = ExpatCustomer.create({
      name: 'Helpers',
      contactInfo,
      countryOfOrigin: 'USA',
      residencyStatus: 'PERMANENT',
      residenceDuration: 12,
      hasSubscription: false,
      customerSegment: base,
      b2cSegment: b2c
    });
    if (expRes.isFailure()) throw new Error();
    const exp = expRes.value;
    expect(exp.isB2CCustomer()).toBe(true);
    expect(exp.isB2BCustomer()).toBe(false);

    const addr = createAddress();
    const { base: baseB2B, b2b } = createB2BSegment();
    const truckRes = FoodTruckCustomer.create({
      name: 'Truck',
      contactInfo,
      businessName: 'Tasty',
      taxId: 'TAX123',
      businessLicenseNumber: 'LIC456',
      cuisineType: ['BBQ'],
      operatingLocations: [addr],
      storageCapacity: 'SMALL',
      creditTerms: 'NET_30',
      customerSegment: baseB2B,
      b2bSegment: b2b
    });
    if (truckRes.isFailure()) throw new Error();
    const truck = truckRes.value;
    expect(truck.isB2BCustomer()).toBe(true);
    expect(truck.isB2CCustomer()).toBe(false);
  });
});
