import { Customer } from '../../../../src/customers/domain/aggregates/Customer';
import { CustomerSegment } from '../../../../src/customers/domain/value-objects/CustomerSegment';
import { CustomerSegmentType } from '../../../../src/customers/domain/value-objects/CustomerSegmentType';
import { CustomerType } from '../../../../src/customers/domain/value-objects/CustomerType';
import { B2CCustomerSegment } from '../../../../src/customers/domain/value-objects/B2CCustomerSegment';
import { B2BCustomerSegment } from '../../../../src/customers/domain/value-objects/B2BCustomerSegment';
import { v4 as uuidv4 } from 'uuid';

describe('Customer Aggregate with Segment Extensions', () => {
  // Common test data
  const customerId = uuidv4();
  const name = 'Test Customer';
  const email = 'test@example.com';
  const phone = '+1234567890';
  const address = '123 Main St, City, Country';
  
  // Create a valid B2C customer
  const createValidB2CCustomer = () => {
    const customerResult = Customer.create({
      id: customerId,
      name,
      email,
      phone,
      address,
      customerType: CustomerType.DiasporaCommunity,
    });
    
    expect(customerResult.isSuccess()).toBe(true);
    return customerResult.isSuccess() ? customerResult.value : null;
  };
  
  // Create a valid B2B customer
  const createValidB2BCustomer = () => {
    const customerResult = Customer.create({
      id: customerId,
      name: 'Business Customer',
      email: 'business@example.com',
      phone: '+1987654321',
      address: '456 Business Ave, City, Country',
      customerType: CustomerType.FoodTruck,
    });
    
    expect(customerResult.isSuccess()).toBe(true);
    return customerResult.isSuccess() ? customerResult.value : null;
  };
  
  // Create valid CustomerSegment for B2C
  const createValidB2CCustomerSegment = () => {
    const segmentResult = CustomerSegment.create({
      segmentType: CustomerSegmentType.DiasporaEstablished,
      customerType: CustomerType.DiasporaCommunity,
      acquisitionDate: new Date('2023-01-15'),
      acquisitionChannel: 'Website',
      lifetimeValue: 1250.50,
      engagementScore: 85
    });
    
    expect(segmentResult.isSuccess()).toBe(true);
    return segmentResult.isSuccess() ? segmentResult.value : null;
  };
  
  // Create valid CustomerSegment for B2B
  const createValidB2BCustomerSegment = () => {
    const segmentResult = CustomerSegment.create({
      segmentType: CustomerSegmentType.FoodTruckStartup,
      customerType: CustomerType.FoodTruck,
      acquisitionDate: new Date('2023-01-15'),
      acquisitionChannel: 'Trade Show',
      lifetimeValue: 5000,
      engagementScore: 75
    });
    
    expect(segmentResult.isSuccess()).toBe(true);
    return segmentResult.isSuccess() ? segmentResult.value : null;
  };
  
  // Create valid B2CCustomerSegment
  const createValidB2CSegment = (baseSegment: CustomerSegment) => {
    const b2cSegmentResult = B2CCustomerSegment.create({
      customerSegment: baseSegment,
      culturalPreferences: ['Latin American', 'Caribbean'],
      purchaseFrequency: 2.5,
      averageOrderValue: 75.50,
      loyaltyPoints: 250,
      referralCount: 3
    });
    
    expect(b2cSegmentResult.isSuccess()).toBe(true);
    return b2cSegmentResult.isSuccess() ? b2cSegmentResult.value : null;
  };
  
  // Create valid B2BCustomerSegment
  const createValidB2BSegment = (baseSegment: CustomerSegment) => {
    const b2bSegmentResult = B2BCustomerSegment.create({
      customerSegment: baseSegment,
      businessSize: 'Small',
      annualRevenue: 500000,
      employeeCount: 15,
      orderVolume: 1000,
      paymentTerms: 'Net 30',
      contractType: 'Annual',
      hasSpecialPricing: true,
      accountManagerId: 'AM12345'
    });
    
    expect(b2bSegmentResult.isSuccess()).toBe(true);
    return b2bSegmentResult.isSuccess() ? b2bSegmentResult.value : null;
  };

  describe('Customer creation with segment properties', () => {
    it('should create a valid customer without segment information', () => {
      const customer = createValidB2CCustomer();
      expect(customer).toBeDefined();
      expect(customer?.customerSegment).toBeUndefined();
      expect(customer?.b2cSegment).toBeUndefined();
      expect(customer?.b2bSegment).toBeUndefined();
    });
  });

  describe('updateCustomerSegment', () => {
    it('should update customer segment for B2C customer', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      const segment = createValidB2CCustomerSegment();
      if (!segment) return;
      
      const updateResult = customer.updateCustomerSegment(segment);
      
      expect(updateResult.isSuccess()).toBe(true);
      if (updateResult.isSuccess()) {
        const updatedCustomer = updateResult.value;
        expect(updatedCustomer.customerSegment).toBeDefined();
        expect(updatedCustomer.customerSegment).toBe(segment);
        expect(updatedCustomer.getSegmentType()).toBe(CustomerSegmentType.DiasporaEstablished);
        // Should emit a domain event
        expect(updatedCustomer.domainEvents.length).toBeGreaterThan(0);
        const lastEvent = updatedCustomer.domainEvents[updatedCustomer.domainEvents.length - 1];
        expect(lastEvent.getEventName()).toBe('CustomerSegmentChanged');
      }
    });

    it('should update customer segment for B2B customer', () => {
      const customer = createValidB2BCustomer();
      if (!customer) return;
      
      const segment = createValidB2BCustomerSegment();
      if (!segment) return;
      
      const updateResult = customer.updateCustomerSegment(segment);
      
      expect(updateResult.isSuccess()).toBe(true);
      if (updateResult.isSuccess()) {
        const updatedCustomer = updateResult.value;
        expect(updatedCustomer.customerSegment).toBeDefined();
        expect(updatedCustomer.customerSegment).toBe(segment);
        expect(updatedCustomer.getSegmentType()).toBe(CustomerSegmentType.FoodTruckStartup);
        // Should emit a domain event
        expect(updatedCustomer.domainEvents.length).toBeGreaterThan(0);
      }
    });

    it('should fail when segment customer type does not match customer type', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      const segment = createValidB2BCustomerSegment(); // B2B segment for B2C customer
      if (!segment) return;
      
      const updateResult = customer.updateCustomerSegment(segment);
      
      expect(updateResult.isFailure()).toBe(true);
      expect(updateResult.error).toContain('does not match customer type');
    });
  });

  describe('updateB2CSegment', () => {
    it('should update B2C segment for B2C customer with existing segment', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      const segment = createValidB2CCustomerSegment();
      if (!segment) return;
      
      // First update the base segment
      const updateSegmentResult = customer.updateCustomerSegment(segment);
      expect(updateSegmentResult.isSuccess()).toBe(true);
      
      if (updateSegmentResult.isSuccess()) {
        const customerWithSegment = updateSegmentResult.value;
        
        // Now add B2C segment
        const b2cSegment = createValidB2CSegment(segment);
        if (!b2cSegment) return;
        
        const updateB2CResult = customerWithSegment.updateB2CSegment(b2cSegment);
        
        expect(updateB2CResult.isSuccess()).toBe(true);
        if (updateB2CResult.isSuccess()) {
          const updatedCustomer = updateB2CResult.value;
          expect(updatedCustomer.b2cSegment).toBeDefined();
          expect(updatedCustomer.b2cSegment).toBe(b2cSegment);
          expect(updatedCustomer.isB2CCustomer()).toBe(true);
          expect(updatedCustomer.isB2BCustomer()).toBe(false);
        }
      }
    });

    it('should fail when trying to update B2C segment for B2B customer', () => {
      const customer = createValidB2BCustomer();
      if (!customer) return;
      
      const segment = createValidB2BCustomerSegment();
      if (!segment) return;
      
      // First update the base segment
      const updateSegmentResult = customer.updateCustomerSegment(segment);
      expect(updateSegmentResult.isSuccess()).toBe(true);
      
      if (updateSegmentResult.isSuccess()) {
        const customerWithSegment = updateSegmentResult.value;
        
        // Try to add B2C segment to B2B customer
        const b2cSegment = createValidB2CSegment(createValidB2CCustomerSegment()!);
        if (!b2cSegment) return;
        
        const updateB2CResult = customerWithSegment.updateB2CSegment(b2cSegment);
        
        expect(updateB2CResult.isFailure()).toBe(true);
        expect(updateB2CResult.error).toContain('Cannot add B2C segment to non-B2C customer');
      }
    });

    it('should fail when trying to update B2C segment without base segment', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      // Try to add B2C segment without base segment
      const b2cSegment = createValidB2CSegment(createValidB2CCustomerSegment()!);
      if (!b2cSegment) return;
      
      const updateB2CResult = customer.updateB2CSegment(b2cSegment);
      
      expect(updateB2CResult.isFailure()).toBe(true);
      expect(updateB2CResult.error).toContain('Customer segment must be set before adding B2C segment');
    });
  });

  describe('updateB2BSegment', () => {
    it('should update B2B segment for B2B customer with existing segment', () => {
      const customer = createValidB2BCustomer();
      if (!customer) return;
      
      const segment = createValidB2BCustomerSegment();
      if (!segment) return;
      
      // First update the base segment
      const updateSegmentResult = customer.updateCustomerSegment(segment);
      expect(updateSegmentResult.isSuccess()).toBe(true);
      
      if (updateSegmentResult.isSuccess()) {
        const customerWithSegment = updateSegmentResult.value;
        
        // Now add B2B segment
        const b2bSegment = createValidB2BSegment(segment);
        if (!b2bSegment) return;
        
        const updateB2BResult = customerWithSegment.updateB2BSegment(b2bSegment);
        
        expect(updateB2BResult.isSuccess()).toBe(true);
        if (updateB2BResult.isSuccess()) {
          const updatedCustomer = updateB2BResult.value;
          expect(updatedCustomer.b2bSegment).toBeDefined();
          expect(updatedCustomer.b2bSegment).toBe(b2bSegment);
          expect(updatedCustomer.isB2BCustomer()).toBe(true);
          expect(updatedCustomer.isB2CCustomer()).toBe(false);
        }
      }
    });

    it('should fail when trying to update B2B segment for B2C customer', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      const segment = createValidB2CCustomerSegment();
      if (!segment) return;
      
      // First update the base segment
      const updateSegmentResult = customer.updateCustomerSegment(segment);
      expect(updateSegmentResult.isSuccess()).toBe(true);
      
      if (updateSegmentResult.isSuccess()) {
        const customerWithSegment = updateSegmentResult.value;
        
        // Try to add B2B segment to B2C customer
        const b2bSegment = createValidB2BSegment(createValidB2BCustomerSegment()!);
        if (!b2bSegment) return;
        
        const updateB2BResult = customerWithSegment.updateB2BSegment(b2bSegment);
        
        expect(updateB2BResult.isFailure()).toBe(true);
        expect(updateB2BResult.error).toContain('Cannot add B2B segment to non-B2B customer');
      }
    });

    it('should fail when trying to update B2B segment without base segment', () => {
      const customer = createValidB2BCustomer();
      if (!customer) return;
      
      // Try to add B2B segment without base segment
      const b2bSegment = createValidB2BSegment(createValidB2BCustomerSegment()!);
      if (!b2bSegment) return;
      
      const updateB2BResult = customer.updateB2BSegment(b2bSegment);
      
      expect(updateB2BResult.isFailure()).toBe(true);
      expect(updateB2BResult.error).toContain('Customer segment must be set before adding B2B segment');
    });
  });

  describe('Customer type helpers', () => {
    it('should correctly identify B2C customer types', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      expect(customer.isB2CCustomer()).toBe(true);
      expect(customer.isB2BCustomer()).toBe(false);
    });

    it('should correctly identify B2B customer types', () => {
      const customer = createValidB2BCustomer();
      if (!customer) return;
      
      expect(customer.isB2CCustomer()).toBe(false);
      expect(customer.isB2BCustomer()).toBe(true);
    });
  });

  describe('getSegmentType', () => {
    it('should return undefined when no segment is set', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      expect(customer.getSegmentType()).toBeUndefined();
    });

    it('should return the correct segment type when segment is set', () => {
      const customer = createValidB2CCustomer();
      if (!customer) return;
      
      const segment = createValidB2CCustomerSegment();
      if (!segment) return;
      
      const updateResult = customer.updateCustomerSegment(segment);
      expect(updateResult.isSuccess()).toBe(true);
      
      if (updateResult.isSuccess()) {
        const updatedCustomer = updateResult.value;
        expect(updatedCustomer.getSegmentType()).toBe(CustomerSegmentType.DiasporaEstablished);
      }
    });
  });
});
