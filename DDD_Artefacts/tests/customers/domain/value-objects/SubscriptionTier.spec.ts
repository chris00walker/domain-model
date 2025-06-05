import { SubscriptionTier } from '../../../../src/customers/domain/value-objects/SubscriptionTier';
import { CustomerSegmentType } from '../../../../src/customers/domain/value-objects/CustomerSegmentType';

describe('SubscriptionTier', () => {
  // Valid test data
  const validProps = {
    name: 'Premium',
    level: 3,
    monthlyPrice: 29.99,
    compatibleSegments: [
      CustomerSegmentType.DiasporaEstablished,
      CustomerSegmentType.DiasporaNewcomer,
      CustomerSegmentType.SpecialtyChef
    ],
    benefits: {
      discountPercentage: 15,
      freeShipping: true,
      prioritySupport: true,
      exclusiveAccess: true,
      earlyAccess: true,
      maxMonthlyBoxes: 3,
      extraProductsPerBox: 2,
      customizationOptions: ['flavor profile', 'origin preferences'],
      loyaltyPointsMultiplier: 2
    },
    description: 'Our premium subscription with exclusive benefits',
    minSubscriptionMonths: 3,
    autoRenewal: true,
    tierCode: 'PREMIUM_TIER'
  };

  describe('creation', () => {
    it('should create a valid subscription tier', () => {
      const result = SubscriptionTier.create(validProps);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const tier = result.value;
        expect(tier.name).toBe('Premium');
        expect(tier.level).toBe(3);
        expect(tier.monthlyPrice).toBe(29.99);
        expect(tier.compatibleSegments).toEqual(validProps.compatibleSegments);
        expect(tier.benefits).toEqual(validProps.benefits);
        expect(tier.description).toBe('Our premium subscription with exclusive benefits');
        expect(tier.minSubscriptionMonths).toBe(3);
        expect(tier.autoRenewal).toBe(true);
        expect(tier.tierCode).toBe('PREMIUM_TIER');
      }
    });

    it('should create a valid subscription tier with only required properties', () => {
      const result = SubscriptionTier.create({
        name: 'Basic',
        level: 1,
        monthlyPrice: 9.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 5,
          freeShipping: false,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: false
        }
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const tier = result.value;
        expect(tier.name).toBe('Basic');
        expect(tier.level).toBe(1);
        expect(tier.monthlyPrice).toBe(9.99);
        expect(tier.compatibleSegments).toEqual([CustomerSegmentType.DiasporaNewcomer]);
        expect(tier.description).toBeUndefined();
        expect(tier.minSubscriptionMonths).toBe(1);
        expect(tier.autoRenewal).toBe(true);
        expect(tier.tierCode).toBe('BASIC');
      }
    });

    it('should fail when name is missing', () => {
      const result = SubscriptionTier.create({
        //@ts-ignore - Testing invalid input
        name: null,
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('name');
    });

    it('should fail when name is empty string', () => {
      const result = SubscriptionTier.create({
        name: '   ',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('name cannot be empty');
    });

    it('should fail when level is negative', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: -1,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('level cannot be negative');
    });

    it('should fail when monthly price is negative', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: -19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('price cannot be negative');
    });

    it('should fail when compatible segments array is empty', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('At least one compatible customer segment must be specified');
    });

    it('should fail when benefits are missing', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        //@ts-ignore - Testing invalid input
        benefits: null
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('benefits');
    });

    it('should fail when discount percentage is outside valid range', () => {
      let result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: -5,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Discount percentage must be between 0 and 100');

      result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 110,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Discount percentage must be between 0 and 100');
    });

    it('should fail when minimum subscription months is zero or negative', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true
        },
        minSubscriptionMonths: 0
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Minimum subscription months must be greater than zero');
    });

    it('should fail when loyalty points multiplier is less than 1', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true,
          loyaltyPointsMultiplier: 0.5
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Loyalty points multiplier must be at least 1');
    });

    it('should fail when maxMonthlyBoxes is zero or negative', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true,
          maxMonthlyBoxes: 0
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Maximum monthly boxes must be greater than zero');
    });

    it('should fail when extraProductsPerBox is negative', () => {
      const result = SubscriptionTier.create({
        name: 'Standard',
        level: 2,
        monthlyPrice: 19.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 10,
          freeShipping: true,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: true,
          extraProductsPerBox: -2
        }
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Extra products per box cannot be negative');
    });
  });

  describe('derived properties', () => {
    it('should calculate annual price correctly', () => {
      const result = SubscriptionTier.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        expect(tier.annualPrice).toBe(29.99 * 12);
      }
    });

    it('should calculate minimum commitment value correctly', () => {
      const result = SubscriptionTier.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        expect(tier.minimumCommitmentValue).toBe(29.99 * 3);
      }
    });

    it('should generate tierCode if not provided', () => {
      const props = { ...validProps };
      delete props.tierCode;
      
      const result = SubscriptionTier.create(props);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        expect(tier.tierCode).toBe('PREMIUM');
      }
    });
  });

  describe('compatibility checks', () => {
    it('should correctly check if segment is compatible', () => {
      const result = SubscriptionTier.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        expect(tier.isCompatibleWithSegment(CustomerSegmentType.DiasporaEstablished)).toBe(true);
        expect(tier.isCompatibleWithSegment(CustomerSegmentType.FoodTruckStartup)).toBe(false);
      }
    });
  });

  describe('update methods', () => {
    it('should update monthly price', () => {
      const result = SubscriptionTier.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        const updatedResult = tier.updateMonthlyPrice(39.99);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.monthlyPrice).toBe(39.99);
          expect(updatedResult.value.name).toBe(validProps.name);
          expect(updatedResult.value.level).toBe(validProps.level);
        }
      }
    });

    it('should update benefits', () => {
      const result = SubscriptionTier.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        const updatedResult = tier.updateBenefits({
          discountPercentage: 20,
          maxMonthlyBoxes: 4
        });
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.benefits.discountPercentage).toBe(20);
          expect(updatedResult.value.benefits.maxMonthlyBoxes).toBe(4);
          // Other benefits should remain unchanged
          expect(updatedResult.value.benefits.freeShipping).toBe(validProps.benefits.freeShipping);
          expect(updatedResult.value.benefits.extraProductsPerBox).toBe(validProps.benefits.extraProductsPerBox);
        }
      }
    });

    it('should update compatible segments', () => {
      const result = SubscriptionTier.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        const newSegments = [
          CustomerSegmentType.DiasporaEstablished,
          CustomerSegmentType.SpecialtyChef,
          CustomerSegmentType.FoodTruckEstablished
        ];
        const updatedResult = tier.updateCompatibleSegments(newSegments);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.compatibleSegments).toEqual(newSegments);
        }
      }
    });

    it('should update minimum subscription months', () => {
      const result = SubscriptionTier.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const tier = result.value;
        const updatedResult = tier.updateMinimumSubscriptionMonths(6);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.minSubscriptionMonths).toBe(6);
        }
      }
    });
  });

  describe('tier comparison', () => {
    it('should correctly compare tiers', () => {
      // Create two tiers with different levels
      const tierLow = SubscriptionTier.create({
        name: 'Basic',
        level: 1,
        monthlyPrice: 9.99,
        compatibleSegments: [CustomerSegmentType.DiasporaNewcomer],
        benefits: {
          discountPercentage: 5,
          freeShipping: false,
          prioritySupport: false,
          exclusiveAccess: false,
          earlyAccess: false
        }
      });

      const tierHigh = SubscriptionTier.create({
        name: 'Premium',
        level: 3,
        monthlyPrice: 29.99,
        compatibleSegments: [CustomerSegmentType.DiasporaEstablished],
        benefits: {
          discountPercentage: 15,
          freeShipping: true,
          prioritySupport: true,
          exclusiveAccess: true,
          earlyAccess: true
        }
      });
      
      expect(tierLow.isSuccess() && tierHigh.isSuccess()).toBe(true);
      
      if (tierLow.isSuccess() && tierHigh.isSuccess()) {
        expect(tierHigh.value.isBetterThan(tierLow.value)).toBe(true);
        expect(tierLow.value.isBetterThan(tierHigh.value)).toBe(false);
      }
    });
  });
});
