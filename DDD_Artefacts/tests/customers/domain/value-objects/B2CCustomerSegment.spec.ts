import { B2CCustomerSegment } from '../../../../src/customers/domain/value-objects/B2CCustomerSegment';
import { CustomerSegment } from '../../../../src/customers/domain/value-objects/CustomerSegment';
import { CustomerSegmentType } from '../../../../src/customers/domain/value-objects/CustomerSegmentType';
import { CustomerType } from '../../../../src/customers/domain/value-objects/CustomerType';

describe('B2CCustomerSegment', () => {
  // First create a valid CustomerSegment to use in tests
  const validCustomerSegmentProps = {
    segmentType: CustomerSegmentType.DiasporaEstablished,
    customerType: CustomerType.DiasporaCommunity,
    acquisitionDate: new Date('2023-01-15'),
    acquisitionChannel: 'Website',
    lifetimeValue: 1250.50,
    engagementScore: 85,
    preferredCommunicationChannel: 'Email',
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

  const validB2CProps = {
    customerSegment: {} as CustomerSegment, // Will be set in beforeEach
    culturalPreferences: ['Latin American', 'Caribbean'],
    dietaryRestrictions: ['Gluten-free', 'Organic'],
    purchaseFrequency: 2.5,
    averageOrderValue: 75.50,
    loyaltyPoints: 250,
    referralCount: 3
  };

  beforeEach(() => {
    validB2CProps.customerSegment = validCustomerSegment;
  });

  describe('create', () => {
    it('should create a valid B2CCustomerSegment', () => {
      const result = B2CCustomerSegment.create(validB2CProps);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const segment = result.value;
        expect(segment.customerSegment).toBe(validCustomerSegment);
        expect(segment.culturalPreferences).toEqual(['Latin American', 'Caribbean']);
        expect(segment.dietaryRestrictions).toEqual(['Gluten-free', 'Organic']);
        expect(segment.purchaseFrequency).toBe(2.5);
        expect(segment.averageOrderValue).toBe(75.50);
        expect(segment.loyaltyPoints).toBe(250);
        expect(segment.referralCount).toBe(3);
      }
    });

    it('should create a valid B2CCustomerSegment without optional properties', () => {
      const props = {
        ...validB2CProps,
        dietaryRestrictions: undefined
      };

      const result = B2CCustomerSegment.create(props);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const segment = result.value;
        expect(segment.dietaryRestrictions).toBeUndefined();
      }
    });

    it('should fail when required properties are missing', () => {
      const props = {
        ...validB2CProps,
        culturalPreferences: undefined
      };

      // @ts-ignore - Intentionally testing with missing property
      const result = B2CCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('culturalPreferences');
    });

    it('should fail when cultural preferences array is empty', () => {
      const props = {
        ...validB2CProps,
        culturalPreferences: []
      };

      const result = B2CCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Cultural preferences cannot be empty');
    });

    it('should fail when purchase frequency is negative', () => {
      const props = {
        ...validB2CProps,
        purchaseFrequency: -1
      };

      const result = B2CCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Purchase frequency cannot be negative');
    });

    it('should fail when average order value is negative', () => {
      const props = {
        ...validB2CProps,
        averageOrderValue: -50
      };

      const result = B2CCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Average order value cannot be negative');
    });

    it('should fail when loyalty points are negative', () => {
      const props = {
        ...validB2CProps,
        loyaltyPoints: -100
      };

      const result = B2CCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Loyalty points cannot be negative');
    });

    it('should fail when referral count is negative', () => {
      const props = {
        ...validB2CProps,
        referralCount: -2
      };

      const result = B2CCustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Referral count cannot be negative');
    });

    it('should fail when customer segment is not a B2C type', () => {
      // Create a B2B customer segment
      const b2bSegmentProps = {
        segmentType: CustomerSegmentType.FoodTruckStartup,
        customerType: CustomerType.FoodTruck,
        acquisitionDate: new Date('2023-01-15'),
        acquisitionChannel: 'Trade Show',
        lifetimeValue: 5000,
        engagementScore: 75
      };
      
      const b2bSegmentResult = CustomerSegment.create(b2bSegmentProps);
      expect(b2bSegmentResult.isSuccess()).toBe(true);
      
      if (b2bSegmentResult.isSuccess()) {
        const props = {
          ...validB2CProps,
          customerSegment: b2bSegmentResult.value
        };

        const result = B2CCustomerSegment.create(props);
        
        expect(result.isFailure()).toBe(true);
        expect(result.getErrorValue()).toContain('is not a B2C type');
      }
    });
  });

  describe('updateLoyaltyPoints', () => {
    it('should update the loyalty points', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateLoyaltyPoints(500);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.loyaltyPoints).toBe(500);
          // Other properties should remain unchanged
          expect(updatedResult.value.customerSegment).toBe(segment.customerSegment);
          expect(updatedResult.value.culturalPreferences).toEqual(segment.culturalPreferences);
        }
      }
    });

    it('should fail when new loyalty points value is negative', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateLoyaltyPoints(-50);
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Loyalty points cannot be negative');
      }
    });
  });

  describe('addCulturalPreferences', () => {
    it('should add new cultural preferences', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.addCulturalPreferences(['Mediterranean', 'Middle Eastern']);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.culturalPreferences).toEqual(
            expect.arrayContaining(['Latin American', 'Caribbean', 'Mediterranean', 'Middle Eastern'])
          );
          expect(updatedResult.value.culturalPreferences.length).toBe(4);
        }
      }
    });

    it('should not add duplicate cultural preferences', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.addCulturalPreferences(['Caribbean', 'Mediterranean']);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.culturalPreferences).toEqual(
            expect.arrayContaining(['Latin American', 'Caribbean', 'Mediterranean'])
          );
          expect(updatedResult.value.culturalPreferences.length).toBe(3);
        }
      }
    });

    it('should fail when new cultural preferences array is empty', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.addCulturalPreferences([]);
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Cultural preferences cannot be empty');
      }
    });
  });

  describe('updateDietaryRestrictions', () => {
    it('should update dietary restrictions', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateDietaryRestrictions(['Vegan', 'Nut-free']);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.dietaryRestrictions).toEqual(['Vegan', 'Nut-free']);
        }
      }
    });

    it('should set dietary restrictions to undefined when empty array is provided', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateDietaryRestrictions([]);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.dietaryRestrictions).toBeUndefined();
        }
      }
    });
  });

  describe('updatePurchaseMetrics', () => {
    it('should update purchase frequency and average order value', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updatePurchaseMetrics(3.5, 100);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.purchaseFrequency).toBe(3.5);
          expect(updatedResult.value.averageOrderValue).toBe(100);
        }
      }
    });

    it('should fail when purchase frequency is negative', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updatePurchaseMetrics(-1, 100);
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Purchase frequency cannot be negative');
      }
    });

    it('should fail when average order value is negative', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updatePurchaseMetrics(3.5, -50);
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Average order value cannot be negative');
      }
    });
  });

  describe('incrementReferralCount', () => {
    it('should increment the referral count by 1', () => {
      const segmentResult = B2CCustomerSegment.create(validB2CProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const initialCount = segment.referralCount;
        const updatedResult = segment.incrementReferralCount();
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.referralCount).toBe(initialCount + 1);
        }
      }
    });
  });
});
