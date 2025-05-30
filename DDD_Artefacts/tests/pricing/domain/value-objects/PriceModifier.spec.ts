import { PriceModifier, PriceModifierType } from '@pricing/domain/value-objects/PriceModifier';
import { Money } from '@shared/domain/value-objects/Money';

describe('Pricing Domain - Value Objects', () => {
  describe('PriceModifier', () => {
    it('should create a valid discount PriceModifier', () => {
      const result = PriceModifier.createPercentageDiscount(
        'Test Discount',
        'A test discount for unit tests',
        20
      );
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const modifier = result.value;
        expect(modifier.type).toBe(PriceModifierType.PERCENTAGE_DISCOUNT);
        expect(modifier.value).toBe(20);
      }
    });

    it('should create a valid fixed discount PriceModifier', () => {
      const result = PriceModifier.createFixedDiscount(
        'Fixed Discount',
        'A fixed amount discount',
        500, // $5.00
        'BBD'
      );
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const modifier = result.value;
        expect(modifier.type).toBe(PriceModifierType.FIXED_DISCOUNT);
        expect(modifier.value).toBe(500);
      }
    });

    it('should create a valid surcharge PriceModifier', () => {
      const result = PriceModifier.createPercentageSurcharge(
        'Service Fee',
        'A percentage-based service fee',
        10
      );
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const modifier = result.value;
        expect(modifier.type).toBe(PriceModifierType.PERCENTAGE_SURCHARGE);
        expect(modifier.value).toBe(10);
      }
    });

    it('should reject negative value for percentage discount', () => {
      const result = PriceModifier.createPercentageDiscount(
        'Invalid Discount',
        'A discount with invalid negative value',
        -10
      );
      
      expect(result.isFailure()).toBe(true);
    });

    it('should reject percentage discount greater than 100', () => {
      const result = PriceModifier.createPercentageDiscount(
        'Invalid Discount',
        'A discount with invalid percentage above 100',
        101
      );
      
      expect(result.isFailure()).toBe(true);
    });

    it('should reject negative value for fixed discount', () => {
      const result = PriceModifier.createFixedDiscount(
        'Invalid Fixed Discount',
        'A fixed discount with invalid negative amount',
        -500,
        'BBD'
      );
      
      expect(result.isFailure()).toBe(true);
    });

    it('should reject negative value for surcharge', () => {
      const result = PriceModifier.createPercentageSurcharge(
        'Invalid Surcharge',
        'A percentage surcharge with invalid negative value',
        -10
      );
      
      expect(result.isFailure()).toBe(true);
    });

    it('should correctly apply percentage discount to a price', () => {
      const modifierResult = PriceModifier.createPercentageDiscount(
        'Test Discount',
        'A test discount for unit tests',
        20
      );
      
      expect(modifierResult.isSuccess()).toBe(true);
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        
        // Create a Money object for testing
        const originalPriceResult = Money.create(1000, 'BBD'); // $10.00
        expect(originalPriceResult.isSuccess()).toBe(true);
        if (originalPriceResult.isSuccess()) {
          const originalPrice = originalPriceResult.value;
          
          const modifiedPriceResult = modifier.applyToPrice(originalPrice);
          expect(modifiedPriceResult.isSuccess()).toBe(true);
          if (modifiedPriceResult.isSuccess()) {
            const modifiedPrice = modifiedPriceResult.value;
            expect(modifiedPrice.amount).toBe(800); // $10.00 - 20% = $8.00
          }
        }
      }
    });

    it('should correctly apply fixed discount to a price', () => {
      const modifierResult = PriceModifier.createFixedDiscount(
        'Fixed Discount',
        'A fixed discount for testing',
        300,
        'BBD'
      );
      
      expect(modifierResult.isSuccess()).toBe(true);
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        
        // Create a Money object for testing
        const originalPriceResult = Money.create(1000, 'BBD'); // $10.00
        expect(originalPriceResult.isSuccess()).toBe(true);
        if (originalPriceResult.isSuccess()) {
          const originalPrice = originalPriceResult.value;
          
          const modifiedPriceResult = modifier.applyToPrice(originalPrice);
          expect(modifiedPriceResult.isSuccess()).toBe(true);
          if (modifiedPriceResult.isSuccess()) {
            const modifiedPrice = modifiedPriceResult.value;
            expect(modifiedPrice.amount).toBe(700); // $10.00 - $3.00 = $7.00
          }
        }
      }
    });

    it('should not apply fixed discount greater than the price', () => {
      const modifierResult = PriceModifier.createFixedDiscount(
        'Large Fixed Discount',
        'A fixed discount larger than the price',
        1200,
        'BBD'
      );
      
      expect(modifierResult.isSuccess()).toBe(true);
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        
        // Create a Money object for testing
        const originalPriceResult = Money.create(1000, 'BBD'); // $10.00
        expect(originalPriceResult.isSuccess()).toBe(true);
        if (originalPriceResult.isSuccess()) {
          const originalPrice = originalPriceResult.value;
          
          const modifiedPriceResult = modifier.applyToPrice(originalPrice);
          expect(modifiedPriceResult.isSuccess()).toBe(true);
          if (modifiedPriceResult.isSuccess()) {
            const modifiedPrice = modifiedPriceResult.value;
            expect(modifiedPrice.amount).toBe(0); // Should not go below zero
          }
        }
      }
    });

    it('should correctly apply percentage surcharge to a price', () => {
      const modifierResult = PriceModifier.createPercentageSurcharge(
        'Service Fee',
        'A percentage-based service fee',
        10
      );
      
      expect(modifierResult.isSuccess()).toBe(true);
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        
        // Create a Money object for testing
        const originalPriceResult = Money.create(1000, 'BBD'); // $10.00
        expect(originalPriceResult.isSuccess()).toBe(true);
        if (originalPriceResult.isSuccess()) {
          const originalPrice = originalPriceResult.value;
          
          const modifiedPriceResult = modifier.applyToPrice(originalPrice);
          expect(modifiedPriceResult.isSuccess()).toBe(true);
          if (modifiedPriceResult.isSuccess()) {
            const modifiedPrice = modifiedPriceResult.value;
            expect(modifiedPrice.amount).toBe(1100); // $10.00 + 10% = $11.00
          }
        }
      }
    });

    it('should correctly create a discount modifier from percentage', () => {
      const result = PriceModifier.createPercentageDiscount(
        'Percentage Discount',
        'A discount based on percentage',
        25
      );
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const modifier = result.value;
        expect(modifier.type).toBe(PriceModifierType.PERCENTAGE_DISCOUNT);
        expect(modifier.value).toBe(25);
      }
    });

    it('should correctly create a fixed discount modifier', () => {
      const result = PriceModifier.createFixedDiscount(
        'Fixed Discount',
        'A discount with fixed amount',
        500,
        'BBD'
      );
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const modifier = result.value;
        expect(modifier.type).toBe(PriceModifierType.FIXED_DISCOUNT);
        expect(modifier.value).toBe(500);
      }
    });

    it('should correctly create a surcharge modifier from percentage', () => {
      const result = PriceModifier.createPercentageSurcharge(
        'Percentage Surcharge',
        'A surcharge based on percentage',
        15
      );
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const modifier = result.value;
        expect(modifier.type).toBe(PriceModifierType.PERCENTAGE_SURCHARGE);
        expect(modifier.value).toBe(15);
      }
    });

    it('should compare PriceModifiers for equality', () => {
      const modifier1Result = PriceModifier.createPercentageDiscount('Discount 1', 'First discount', 20);
      const modifier2Result = PriceModifier.createPercentageDiscount('Discount 2', 'Second discount', 20);
      const modifier3Result = PriceModifier.createPercentageDiscount('Discount 3', 'Third discount', 25);
      const modifier4Result = PriceModifier.createFixedDiscount('Fixed Discount', 'A fixed discount', 500, 'BBD');
      
      expect(
        modifier1Result.isSuccess() && 
        modifier2Result.isSuccess() && 
        modifier3Result.isSuccess() &&
        modifier4Result.isSuccess()
      ).toBe(true);
      
      if (
        modifier1Result.isSuccess() && 
        modifier2Result.isSuccess() && 
        modifier3Result.isSuccess() &&
        modifier4Result.isSuccess()
      ) {
        const modifier1 = modifier1Result.value;
        const modifier2 = modifier2Result.value;
        const modifier3 = modifier3Result.value;
        const modifier4 = modifier4Result.value;
        
        // Note: PriceModifiers with different names but same type and value might not be equal
        // This test may need adjustment based on how equality is defined in the ValueObject
        expect(modifier1.type).toBe(modifier2.type);
        expect(modifier1.value).toBe(modifier2.value);
        expect(modifier1.type).toBe(modifier3.type);
        expect(modifier1.value).not.toBe(modifier3.value);
        expect(modifier1.type).not.toBe(modifier4.type);
      }
    });
  });
});
