import { DynamicPricingFormula } from '@pricing/domain/value-objects/DynamicPricingFormula';

describe('Pricing Domain - Value Objects', () => {
  describe('DynamicPricingFormula', () => {
    it('should create a valid DynamicPricingFormula with default parameters', () => {
      const result = DynamicPricingFormula.create();
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const formula = result.value;
        // Default parameters should be set
        expect(formula.beta).toBe(0.4);
        expect(formula.gamma).toBe(0.5);
        expect(formula.maxDays).toBe(45);
      }
    });

    it('should create a valid DynamicPricingFormula with custom parameters', () => {
      const result = DynamicPricingFormula.create(0.3, 0.6, 30);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const formula = result.value;
        expect(formula.beta).toBe(0.3);
        expect(formula.gamma).toBe(0.6);
        expect(formula.maxDays).toBe(30);
      }
    });

    it('should reject invalid beta parameter (negative)', () => {
      const result = DynamicPricingFormula.create(-0.1, 0.5, 45);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject invalid beta parameter (greater than 1)', () => {
      const result = DynamicPricingFormula.create(1.1, 0.5, 45);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject invalid gamma parameter (negative)', () => {
      const result = DynamicPricingFormula.create(0.4, -0.1, 45);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject invalid gamma parameter (greater than 1)', () => {
      const result = DynamicPricingFormula.create(0.4, 1.1, 45);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject invalid maxDays parameter (negative)', () => {
      const result = DynamicPricingFormula.create(0.4, 0.5, -1);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject invalid maxDays parameter (zero)', () => {
      const result = DynamicPricingFormula.create(0.4, 0.5, 0);
      expect(result.isFailure()).toBe(true);
    });

    it('should calculate correct discount for product with long shelf life', () => {
      const formulaResult = DynamicPricingFormula.create();
      expect(formulaResult.isSuccess()).toBe(true);
      if (formulaResult.isSuccess()) {
        const formula = formulaResult.value;
        
        // Product with 30 days remaining, high demand (0.8), medium profitability (0.5)
        const discountResult = formula.calculatePercentageDiscount(30, 0.8, 0.5);
        expect(discountResult.isSuccess()).toBe(true);
        if (discountResult.isSuccess()) {
          // Discount should be relatively low since there's still plenty of time left
          const discount = discountResult.value;
          expect(discount).toBeGreaterThan(0);
          expect(discount).toBeLessThan(20);
        }
      }
    });

    it('should calculate higher discount for product close to expiry', () => {
      const formulaResult = DynamicPricingFormula.create();
      expect(formulaResult.isSuccess()).toBe(true);
      if (formulaResult.isSuccess()) {
        const formula = formulaResult.value;
        
        // Product with 5 days remaining, low demand (0.2), medium profitability (0.5)
        const discountResult = formula.calculatePercentageDiscount(5, 0.2, 0.5);
        expect(discountResult.isSuccess()).toBe(true);
        if (discountResult.isSuccess()) {
          // Discount should be high due to approaching expiry and low demand
          const discount = discountResult.value;
          expect(discount).toBeGreaterThan(40);
        }
      }
    });

    it('should calculate correct discount based on demand factor', () => {
      const formulaResult = DynamicPricingFormula.create();
      expect(formulaResult.isSuccess()).toBe(true);
      if (formulaResult.isSuccess()) {
        const formula = formulaResult.value;
        
        // Same days remaining (15), different demand factors
        const lowDemandResult = formula.calculatePercentageDiscount(15, 0.1, 0.5);
        const highDemandResult = formula.calculatePercentageDiscount(15, 0.9, 0.5);
        
        expect(lowDemandResult.isSuccess() && highDemandResult.isSuccess()).toBe(true);
        if (lowDemandResult.isSuccess() && highDemandResult.isSuccess()) {
          // Lower demand should result in higher discount
          expect(lowDemandResult.value).toBeGreaterThan(highDemandResult.value);
        }
      }
    });

    it('should calculate correct discount based on profitability factor', () => {
      const formulaResult = DynamicPricingFormula.create();
      expect(formulaResult.isSuccess()).toBe(true);
      if (formulaResult.isSuccess()) {
        const formula = formulaResult.value;
        
        // Same days remaining (15), same demand (0.5), different profitability
        const lowProfitResult = formula.calculatePercentageDiscount(15, 0.5, 0.1);
        const highProfitResult = formula.calculatePercentageDiscount(15, 0.5, 0.9);
        
        expect(lowProfitResult.isSuccess() && highProfitResult.isSuccess()).toBe(true);
        if (lowProfitResult.isSuccess() && highProfitResult.isSuccess()) {
          // Lower profitability should result in higher discount
          expect(lowProfitResult.value).toBeGreaterThan(highProfitResult.value);
        }
      }
    });

    it('should handle edge case of 0 days remaining', () => {
      const formulaResult = DynamicPricingFormula.create();
      expect(formulaResult.isSuccess()).toBe(true);
      if (formulaResult.isSuccess()) {
        const formula = formulaResult.value;
        
        // 0 days remaining should result in maximum discount
        const discountResult = formula.calculatePercentageDiscount(0, 0.5, 0.5);
        expect(discountResult.isSuccess()).toBe(true);
        if (discountResult.isSuccess()) {
          expect(discountResult.value).toBeCloseTo(100, 0); // Should be close to 100%
        }
      }
    });

    it('should handle days remaining exceeding maxDays', () => {
      const formulaResult = DynamicPricingFormula.create(0.4, 0.5, 30);
      expect(formulaResult.isSuccess()).toBe(true);
      if (formulaResult.isSuccess()) {
        const formula = formulaResult.value;
        
        // 45 days remaining exceeds maxDays of 30
        const discountResult = formula.calculatePercentageDiscount(45, 0.5, 0.5);
        expect(discountResult.isSuccess()).toBe(true);
        if (discountResult.isSuccess()) {
          // Should get minimal discount
          expect(discountResult.value).toBeLessThan(5);
        }
      }
    });

    it('should compare DynamicPricingFormulas for equality', () => {
      const formula1Result = DynamicPricingFormula.create(0.3, 0.6, 30);
      const formula2Result = DynamicPricingFormula.create(0.3, 0.6, 30);
      const formula3Result = DynamicPricingFormula.create(0.4, 0.5, 45);
      
      expect(formula1Result.isSuccess() && formula2Result.isSuccess() && formula3Result.isSuccess()).toBe(true);
      
      if (formula1Result.isSuccess() && formula2Result.isSuccess() && formula3Result.isSuccess()) {
        const formula1 = formula1Result.value;
        const formula2 = formula2Result.value;
        const formula3 = formula3Result.value;
        
        expect(formula1.equals(formula2)).toBe(true);
        expect(formula1.equals(formula3)).toBe(false);
      }
    });
  });
});
