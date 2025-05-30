import { DiscountPercentage } from '@pricing/domain/value-objects/DiscountPercentage';

describe('Pricing Domain - Value Objects', () => {
  describe('DiscountPercentage', () => {
    it('should create a valid DiscountPercentage', () => {
      const result = DiscountPercentage.create(20);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.value).toBe(20);
      }
    });

    it('should create a valid DiscountPercentage with zero value', () => {
      const result = DiscountPercentage.create(0);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.value).toBe(0);
      }
    });

    it('should reject negative DiscountPercentage', () => {
      const result = DiscountPercentage.create(-10);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject DiscountPercentage greater than 100', () => {
      const result = DiscountPercentage.create(101);
      expect(result.isFailure()).toBe(true);
    });

    it('should correctly apply discount to an amount', () => {
      const discountResult = DiscountPercentage.create(20);
      expect(discountResult.isSuccess()).toBe(true);
      if (discountResult.isSuccess()) {
        const discount = discountResult.value;
        const originalAmount = 100;
        const expectedResult = 80; // 100 - (100 * 20%)
        
        expect(discount.applyToAmount(originalAmount)).toBe(expectedResult);
      }
    });

    it('should correctly apply zero discount to an amount', () => {
      const discountResult = DiscountPercentage.create(0);
      expect(discountResult.isSuccess()).toBe(true);
      if (discountResult.isSuccess()) {
        const discount = discountResult.value;
        const originalAmount = 100;
        const expectedResult = 100; // 100 - (100 * 0%)
        
        expect(discount.applyToAmount(originalAmount)).toBe(expectedResult);
      }
    });

    it('should correctly apply 100% discount to an amount', () => {
      const discountResult = DiscountPercentage.create(100);
      expect(discountResult.isSuccess()).toBe(true);
      if (discountResult.isSuccess()) {
        const discount = discountResult.value;
        const originalAmount = 100;
        const expectedResult = 0; // 100 - (100 * 100%)
        
        expect(discount.applyToAmount(originalAmount)).toBe(expectedResult);
      }
    });

    it('should compare DiscountPercentages for equality', () => {
      const discount1Result = DiscountPercentage.create(20);
      const discount2Result = DiscountPercentage.create(20);
      const discount3Result = DiscountPercentage.create(30);
      
      expect(discount1Result.isSuccess() && discount2Result.isSuccess() && discount3Result.isSuccess()).toBe(true);
      
      if (discount1Result.isSuccess() && discount2Result.isSuccess() && discount3Result.isSuccess()) {
        const discount1 = discount1Result.value;
        const discount2 = discount2Result.value;
        const discount3 = discount3Result.value;
        
        expect(discount1.equals(discount2)).toBe(true);
        expect(discount1.equals(discount3)).toBe(false);
      }
    });

    it('should not be equal to null or undefined', () => {
      const discountResult = DiscountPercentage.create(20);
      expect(discountResult.isSuccess()).toBe(true);
      if (discountResult.isSuccess()) {
        const discount = discountResult.value;
        
        expect(discount.equals(null as any)).toBe(false);
        expect(discount.equals(undefined as any)).toBe(false);
      }
    });

    it('should not be equal to a different type of value object', () => {
      const discountResult = DiscountPercentage.create(20);
      expect(discountResult.isSuccess()).toBe(true);
      if (discountResult.isSuccess()) {
        const discount = discountResult.value;
        const otherValueObject = { equals: () => true, props: { value: 20 } };
        
        expect(discount.equals(otherValueObject as any)).toBe(false);
      }
    });
  });
});
