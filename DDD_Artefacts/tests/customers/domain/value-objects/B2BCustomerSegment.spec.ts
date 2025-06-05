import { B2BCustomerSegment } from '../../../../src/customers/domain/value-objects/B2BCustomerSegment';
import { CustomerSegment } from '../../../../src/customers/domain/value-objects/CustomerSegment';
import { CustomerSegmentType } from '../../../../src/customers/domain/value-objects/CustomerSegmentType';
import { CustomerType } from '../../../../src/customers/domain/value-objects/CustomerType';

describe('B2BCustomerSegment', () => {
  // First create a valid CustomerSegment to use in tests
  const validCustomerSegmentProps = {
    segmentType: CustomerSegmentType.FoodTruckStartup,
    customerType: CustomerType.FoodTruck,
    acquisitionDate: new Date('2023-01-15'),
    acquisitionChannel: 'Trade Show',
    lifetimeValue: 5000,
    engagementScore: 75,
    preferredCommunicationChannel: 'Phone',
    lastSegmentChange: new Date('2023-06-20')
  };

  let validCustomerSegment: CustomerSegment;

  beforeEach(() => {
    const segmentResult = CustomerSegment.create(validCustomerSegmentProps);
    expect(segmentResult.isSuccess()).toBe(true);
    if (segmentResult.isSuccess()) {
      validCustomerSegment = segmentResult.value;
    }
  });

  const validB2BProps = {
    customerSegment: {} as CustomerSegment, // Will be set in beforeEach
    businessSize: 'SMALL' as 'SMALL' | 'MEDIUM' | 'LARGE',
    annualRevenue: 500000,
    employeeCount: 15,
    orderVolume: 1000,
    paymentTerms: 30, // Payment terms in days
    contractType: 'Annual',
    specialPricing: true,
    accountManagerId: 'AM12345'
  };

  beforeEach(() => {
    validB2BProps.customerSegment = validCustomerSegment;
  });

  describe('create', () => {
    it('should create a valid B2BCustomerSegment', () => {
      const result = B2BCustomerSegment.create(validB2BProps);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const segment = result.value;
        expect(segment.customerSegment).toBe(validCustomerSegment);
        expect(segment.businessSize).toBe('SMALL');
        expect(segment.annualRevenue).toBe(500000);
        expect(segment.employeeCount).toBe(15);
        expect(segment.orderVolume).toBe(1000);
        expect(segment.paymentTerms).toBe(30);
        expect(segment.contractType).toBe('Annual');
        expect(segment.specialPricing).toBe(true);
        expect(segment.accountManagerId).toBe('AM12345');
      }
    });

    it('should create a valid B2BCustomerSegment without optional properties', () => {
      const props = {
        ...validB2BProps,
        accountManagerId: undefined,
        specialPricing: false
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const segment = result.value;
        expect(segment.accountManagerId).toBeUndefined();
        expect(segment.specialPricing).toBe(false);
      }
    });

    it('should fail when required properties are missing', () => {
      const props = {
        ...validB2BProps,
        businessSize: undefined
      };

      // @ts-ignore - Intentionally testing with missing property
      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('businessSize');
    });

    it('should fail when business size is empty', () => {
      const props = {
        ...validB2BProps,
        businessSize: 'INVALID' as any
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Business size cannot be empty');
    });

    it('should fail when annual revenue is negative', () => {
      const props = {
        ...validB2BProps,
        annualRevenue: -100000
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Annual revenue cannot be negative');
    });

    it('should fail when employee count is negative', () => {
      const props = {
        ...validB2BProps,
        employeeCount: -5
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Employee count cannot be negative');
    });

    it('should fail when order volume is negative', () => {
      const props = {
        ...validB2BProps,
        orderVolume: -500
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Order volume cannot be negative');
    });

    it('should fail when payment terms is empty', () => {
      const props = {
        ...validB2BProps,
        paymentTerms: -1 // Payment terms must be >= 0
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Payment terms cannot be negative');
    });

    it('should fail when contract type is empty', () => {
      const props = {
        ...validB2BProps,
        contractType: '  '
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Contract type cannot be empty');
    });

    it('should fail when account manager ID is empty', () => {
      const props = {
        ...validB2BProps,
        accountManagerId: '  '
      };

      const result = B2BCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Account manager ID cannot be empty');
    });

    it('should fail when customer segment is not a B2B type', () => {
      // Create a B2C customer segment
      const b2cSegmentProps = {
        segmentType: CustomerSegmentType.DiasporaEstablished,
        customerType: CustomerType.DiasporaCommunity,
        acquisitionDate: new Date('2023-01-15'),
        acquisitionChannel: 'Website',
        lifetimeValue: 1250.50,
        engagementScore: 85
      };
      
      const b2cSegmentResult = CustomerSegment.create(b2cSegmentProps);
      expect(b2cSegmentResult.isSuccess()).toBe(true);
      
      if (b2cSegmentResult.isSuccess()) {
        const props = {
          ...validB2BProps,
          customerSegment: b2cSegmentResult.value
        };

        const result = B2BCustomerSegment.create(props);
        
        expect(result.isFailure()).toBe(true);
        expect(result.getErrorValue()).toContain('is not a B2B type');
      }
    });
  });

  describe('update business metrics', () => {
    let b2bSegment: B2BCustomerSegment;
    
    beforeEach(() => {
      const createResult = B2BCustomerSegment.create(validB2BProps);
      expect(createResult.isSuccess()).toBe(true);
      
      if (createResult.isSuccess()) {
        b2bSegment = createResult.value;
      }
    });
    
    it('should update annual revenue', () => {
      const newRevenue = 750000;
      
      const result = b2bSegment.updateAnnualRevenue(newRevenue);
      
      expect(result.isSuccess()).toBe(true);
      const updatedSegment = result.getValue();
      expect(updatedSegment.annualRevenue).toBe(newRevenue);
    });

    it('should update employee count', () => {
      const newEmployeeCount = 25;
      
      const result = b2bSegment.updateEmployeeCount(newEmployeeCount);
      
      expect(result.isSuccess()).toBe(true);
      const updatedSegment = result.getValue();
      expect(updatedSegment.employeeCount).toBe(newEmployeeCount);
    });
    
    it('should update order volume', () => {
      const newOrderVolume = 1500;
      
      const result = b2bSegment.updateOrderVolume(newOrderVolume);
      
      expect(result.isSuccess()).toBe(true);
      const updatedSegment = result.getValue();
      expect(updatedSegment.orderVolume).toBe(newOrderVolume);
    });

    it('should fail when annual revenue is negative', () => {
      const newRevenue = -100000;
      
      const result = b2bSegment.updateAnnualRevenue(newRevenue);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Annual revenue cannot be negative');
    });

    it('should fail when employee count is negative', () => {
      const newEmployeeCount = -5;
      
      const result = b2bSegment.updateEmployeeCount(newEmployeeCount);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Employee count cannot be negative');
    });

    it('should fail when order volume is negative', () => {
      const newOrderVolume = -500;
      
      const result = b2bSegment.updateOrderVolume(newOrderVolume);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Order volume cannot be negative');
    });
  });

  describe('update contract details', () => {
    let b2bSegment: B2BCustomerSegment;
    
    beforeEach(() => {
      const createResult = B2BCustomerSegment.create(validB2BProps);
      expect(createResult.isSuccess()).toBe(true);
      
      if (createResult.isSuccess()) {
        b2bSegment = createResult.value;
      }
    });

    it('should update payment terms', () => {
      const newPaymentTerms = 60;
      
      const result = b2bSegment.updatePaymentTerms(newPaymentTerms);
      
      expect(result.isSuccess()).toBe(true);
      const updatedSegment = result.getValue();
      expect(updatedSegment.paymentTerms).toBe(newPaymentTerms);
    });

    it('should update contract type', () => {
      const newContractType = 'Quarterly';
      
      const result = b2bSegment.updateContractType(newContractType);
      
      expect(result.isSuccess()).toBe(true);
      const updatedSegment = result.getValue();
      expect(updatedSegment.contractType).toBe(newContractType);
    });

    it('should fail when payment terms is empty', () => {
      const newPaymentTerms = -1;
      
      const result = b2bSegment.updatePaymentTerms(newPaymentTerms);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Payment terms cannot be negative');
    });

    it('should fail when contract type is empty', () => {
      const newContractType = '';
      
      const result = b2bSegment.updateContractType(newContractType);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Contract type cannot be empty');
    });
  });

  describe('updateSpecialPricing', () => {
    it('should update special pricing flag', () => {
      const segmentResult = B2BCustomerSegment.create(validB2BProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.getValue();
        const updatedResult = segment.updateSpecialPricing(false);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.getValue().specialPricing).toBe(false);
          // Other properties should remain unchanged
          expect(updatedResult.getValue().businessSize).toBe(segment.businessSize);
          expect(updatedResult.getValue().orderVolume).toBe(segment.orderVolume);
        }
      }
    });
  });

  describe('account manager assignment', () => {
    it('should assign an account manager', () => {
      const segmentResult = B2BCustomerSegment.create(validB2BProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.getValue();
        const updatedResult = segment.assignAccountManager('AM12345');
        
        expect(updatedResult.isSuccess()).toBe(true);
        const updatedSegment = updatedResult.getValue();
        expect(updatedSegment.accountManagerId).toBe('AM12345');
      }
    });

    it('should fail when account manager ID is empty', () => {
      const segmentResult = B2BCustomerSegment.create(validB2BProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.getValue();
        const updatedResult = segment.assignAccountManager('');
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Account manager ID cannot be empty');
      }
    });

    it('should remove an account manager', () => {
      const segmentResult = B2BCustomerSegment.create(validB2BProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.getValue();
        const updatedResult = segment.removeAccountManager();
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          const updatedSegment = updatedResult.getValue();
          expect(updatedSegment.accountManagerId).toBeUndefined();
        }
      }
    });
  });
});
