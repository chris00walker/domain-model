import { FixedPricingStrategy } from '@pricing/domain/strategies/FixedPricingStrategy';
import { PricingTier, PricingTierType } from '@pricing/domain/value-objects/PricingTier';
import { Money } from '@shared/domain/value-objects/Money';
import { PriceModifier } from '@pricing/domain/value-objects/PriceModifier';
import { Result } from '@shared/core/Result';

describe('Pricing Domain - Strategies', () => {
  describe('FixedPricingStrategy', () => {
    let strategy: FixedPricingStrategy;
    let retailTier: PricingTier;
    
    beforeEach(() => {
      strategy = new FixedPricingStrategy();
      
      const retailTierResult = PricingTier.create(PricingTierType.RETAIL);
      expect(retailTierResult.isSuccess()).toBe(true);
      retailTier = (retailTierResult as Result<PricingTier, string> & { value: PricingTier }).value;
    });
    
    it('should calculate price using markup percentage from pricing tier', () => {
      // Retail tier has 150% markup
      const baseCostResult = Money.create(1000, 'BBD'); // $10.00 BBD
      expect(baseCostResult.isSuccess()).toBe(true);
      
      if (baseCostResult.isSuccess()) {
        const baseCost = baseCostResult.value;
        
        const result = strategy.calculatePrice({
          baseCost,
          quantity: 1,
          pricingTier: retailTier,
          baseMarkupPercentage: retailTier.getBaseMarkupPercentage()
        });
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const price = result.value;
          // Base cost $10.00 + 150% markup = $25.00
          expect(price.amount).toBe(2500);
          expect(price.currency).toBe('BBD');
        }
      }
    });
    
    it('should calculate price for multiple quantities', () => {
      const baseCostResult = Money.create(1000, 'BBD'); // $10.00 BBD
      expect(baseCostResult.isSuccess()).toBe(true);
      
      if (baseCostResult.isSuccess()) {
        const baseCost = baseCostResult.value;
        
        const result = strategy.calculatePrice({
          baseCost,
          quantity: 3,
          pricingTier: retailTier,
          baseMarkupPercentage: retailTier.getBaseMarkupPercentage()
        });
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const price = result.value;
          // Base cost $10.00 + 150% markup = $25.00 x 3 = $75.00
          expect(price.amount).toBe(7500);
          expect(price.currency).toBe('BBD');
        }
      }
    });
    
    it('should apply promotional discount if provided', () => {
      const baseCostResult = Money.create(1000, 'BBD'); // $10.00 BBD
      expect(baseCostResult.isSuccess()).toBe(true);
      
      if (baseCostResult.isSuccess()) {
        const baseCost = baseCostResult.value;
        
        const discountModifierResult = PriceModifier.createPercentageDiscount(
          'Test Discount',
          '20% off for testing',
          20
        );
        expect(discountModifierResult.isSuccess()).toBe(true);
        
        if (discountModifierResult.isSuccess()) {
          const discountModifier = discountModifierResult.value;
          
          const result = strategy.calculatePrice({
            baseCost,
            quantity: 1,
            pricingTier: retailTier,
            baseMarkupPercentage: retailTier.getBaseMarkupPercentage(),
            promotionalModifier: discountModifier
          });
          
          expect(result.isSuccess()).toBe(true);
          if (result.isSuccess()) {
            const price = result.value;
            // Base cost $10.00 + 150% markup = $25.00
            // After 20% discount: $25.00 - $5.00 = $20.00
            expect(price.amount).toBe(2000);
            expect(price.currency).toBe('BBD');
          }
        }
      }
    });
    
    it('should apply fixed discount if provided', () => {
      const baseCostResult = Money.create(1000, 'BBD'); // $10.00 BBD
      expect(baseCostResult.isSuccess()).toBe(true);
      
      if (baseCostResult.isSuccess()) {
        const baseCost = baseCostResult.value;
        
        const fixedDiscountResult = PriceModifier.createFixedDiscount(
          'Fixed Discount',
          '$5.00 off for testing',
          500, // $5.00 discount
          'BBD'
        );
        expect(fixedDiscountResult.isSuccess()).toBe(true);
        
        if (fixedDiscountResult.isSuccess()) {
          const fixedDiscount = fixedDiscountResult.value;
          
          const result = strategy.calculatePrice({
            baseCost,
            quantity: 1,
            pricingTier: retailTier,
            baseMarkupPercentage: retailTier.getBaseMarkupPercentage(),
            promotionalModifier: fixedDiscount
          });
          
          expect(result.isSuccess()).toBe(true);
          if (result.isSuccess()) {
            const price = result.value;
            // Base cost $10.00 + 150% markup = $25.00
            // After $5.00 fixed discount: $25.00 - $5.00 = $20.00
            expect(price.amount).toBe(2000);
            expect(price.currency).toBe('BBD');
          }
        }
      }
    });
    
    it('should apply surcharge if provided', () => {
      const baseCostResult = Money.create(1000, 'BBD'); // $10.00 BBD
      expect(baseCostResult.isSuccess()).toBe(true);
      
      if (baseCostResult.isSuccess()) {
        const baseCost = baseCostResult.value;
        
        const surchargeResult = PriceModifier.createPercentageSurcharge(
          'Test Surcharge',
          '10% surcharge for testing',
          10 // 10% surcharge
        );
        expect(surchargeResult.isSuccess()).toBe(true);
        
        if (surchargeResult.isSuccess()) {
          const surcharge = surchargeResult.value;
          
          const result = strategy.calculatePrice({
            baseCost,
            quantity: 1,
            pricingTier: retailTier,
            baseMarkupPercentage: retailTier.getBaseMarkupPercentage(),
            promotionalModifier: surcharge
          });
          
          expect(result.isSuccess()).toBe(true);
          if (result.isSuccess()) {
            const price = result.value;
            // Base cost $10.00 + 150% markup = $25.00
            // After 10% surcharge: $25.00 + $2.50 = $27.50
            expect(price.amount).toBe(2750);
            expect(price.currency).toBe('BBD');
          }
        }
      }
    });
    
    it('should handle zero or negative base cost gracefully', () => {
      const zeroCostResult = Money.create(0, 'BBD'); // $0.00 BBD
      expect(zeroCostResult.isSuccess()).toBe(true);
      
      if (zeroCostResult.isSuccess()) {
        const zeroCost = zeroCostResult.value;
        
        const result = strategy.calculatePrice({
          baseCost: zeroCost,
          quantity: 1,
          pricingTier: retailTier,
          baseMarkupPercentage: retailTier.getBaseMarkupPercentage()
        });
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const price = result.value;
          // Zero cost with markup is still zero
          expect(price.amount).toBe(0);
          expect(price.currency).toBe('BBD');
        }
      }
    });
    
    it('should enforce margin floor when required', () => {
      // Create a strategy with margin floor enforcement
      const strategyWithFloor = new FixedPricingStrategy();
      
      const baseCostResult = Money.create(1000, 'BBD'); // $10.00 BBD
      expect(baseCostResult.isSuccess()).toBe(true);
      
      if (baseCostResult.isSuccess()) {
        const baseCost = baseCostResult.value;
        
        // Create a discount so large it would violate the margin floor
        const largeDiscountResult = PriceModifier.createPercentageDiscount(
          'Large Test Discount',
          '90% off for testing',
          90 // 90% discount
        );
        expect(largeDiscountResult.isSuccess()).toBe(true);
        
        if (largeDiscountResult.isSuccess()) {
          const largeDiscount = largeDiscountResult.value;
          
          // Retail tier has floor margin of 130%
          const result = strategyWithFloor.calculatePrice({
            baseCost,
            quantity: 1,
            pricingTier: retailTier,
            baseMarkupPercentage: retailTier.getBaseMarkupPercentage(),
            promotionalModifier: largeDiscount
          });
          
          expect(result.isSuccess()).toBe(true);
          if (result.isSuccess()) {
            const price = result.value;
            // Price should be constrained by the floor margin (130%)
            // Minimum price would be $10.00 * 2.3 = $23.00
            expect(price.amount).toBeGreaterThanOrEqual(2300);
          }
        }
      }
    });
  });
});
