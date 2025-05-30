import { MarkupPercentage } from '@pricing/domain/value-objects/MarkupPercentage';

describe('Pricing Domain - Value Objects', () => {
  describe('MarkupPercentage', () => {
    it('should create a valid MarkupPercentage', () => {
      const result = MarkupPercentage.create(50);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.value).toBe(50);
      }
    });

    it('should create a valid MarkupPercentage with zero value', () => {
      const result = MarkupPercentage.create(0);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.value).toBe(0);
      }
    });

    it('should reject negative MarkupPercentage', () => {
      const result = MarkupPercentage.create(-10);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject excessively high MarkupPercentage', () => {
      const result = MarkupPercentage.create(501); // Assuming max is 500%
      expect(result.isFailure()).toBe(true);
    });

    it('should correctly apply markup to an amount', () => {
      const markupResult = MarkupPercentage.create(50);
      expect(markupResult.isSuccess()).toBe(true);
      if (markupResult.isSuccess()) {
        const markup = markupResult.value;
        const baseAmount = 100;
        const expectedResult = 150; // 100 + (100 * 50%)
        
        expect(markup.applyToAmount(baseAmount)).toBe(expectedResult);
      }
    });

    it('should correctly apply zero markup to an amount', () => {
      const markupResult = MarkupPercentage.create(0);
      expect(markupResult.isSuccess()).toBe(true);
      if (markupResult.isSuccess()) {
        const markup = markupResult.value;
        const baseAmount = 100;
        const expectedResult = 100; // 100 + (100 * 0%)
        
        expect(markup.applyToAmount(baseAmount)).toBe(expectedResult);
      }
    });

    it('should compare MarkupPercentages for equality', () => {
      const markup1Result = MarkupPercentage.create(50);
      const markup2Result = MarkupPercentage.create(50);
      const markup3Result = MarkupPercentage.create(75);
      
      expect(markup1Result.isSuccess() && markup2Result.isSuccess() && markup3Result.isSuccess()).toBe(true);
      
      if (markup1Result.isSuccess() && markup2Result.isSuccess() && markup3Result.isSuccess()) {
        const markup1 = markup1Result.value;
        const markup2 = markup2Result.value;
        const markup3 = markup3Result.value;
        
        expect(markup1.equals(markup2)).toBe(true);
        expect(markup1.equals(markup3)).toBe(false);
      }
    });

    it('should not be equal to null or undefined', () => {
      const markupResult = MarkupPercentage.create(50);
      expect(markupResult.isSuccess()).toBe(true);
      if (markupResult.isSuccess()) {
        const markup = markupResult.value;
        
        expect(markup.equals(null as any)).toBe(false);
        expect(markup.equals(undefined as any)).toBe(false);
      }
    });

    it('should not be equal to a different type of value object', () => {
      const markupResult = MarkupPercentage.create(50);
      expect(markupResult.isSuccess()).toBe(true);
      if (markupResult.isSuccess()) {
        const markup = markupResult.value;
        const otherValueObject = { equals: () => true, props: { value: 50 } };
        
        expect(markup.equals(otherValueObject as any)).toBe(false);
      }
    });
  });
});
