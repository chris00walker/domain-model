import { PricingTier, PricingTierType } from '@pricing/domain/value-objects/PricingTier';

describe('Pricing Domain - Value Objects', () => {
  describe('PricingTier', () => {
    it('should create a valid PricingTier', () => {
      const result = PricingTier.create(PricingTierType.RETAIL);
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.type).toBe(PricingTierType.RETAIL);
        expect(result.value.name).toBe('Retail');
      }
    });

    it('should reject null PricingTierType', () => {
      const result = PricingTier.create(null as unknown as PricingTierType);
      expect(result.isFailure()).toBe(true);
    });

    it('should reject invalid PricingTierType', () => {
      const result = PricingTier.create('INVALID_TYPE' as PricingTierType);
      expect(result.isFailure()).toBe(true);
    });

    it('should compare PricingTiers for equality', () => {
      const tier1Result = PricingTier.create(PricingTierType.RETAIL);
      const tier2Result = PricingTier.create(PricingTierType.RETAIL);
      const tier3Result = PricingTier.create(PricingTierType.COMMERCIAL);
      
      expect(tier1Result.isSuccess() && tier2Result.isSuccess() && tier3Result.isSuccess()).toBe(true);
      
      if (tier1Result.isSuccess() && tier2Result.isSuccess() && tier3Result.isSuccess()) {
        const tier1 = tier1Result.value;
        const tier2 = tier2Result.value;
        const tier3 = tier3Result.value;
        
        expect(tier1.equals(tier2)).toBe(true);
        expect(tier1.equals(tier3)).toBe(false);
      }
    });

    it('should correctly determine tier types', () => {
      const retailResult = PricingTier.create(PricingTierType.RETAIL);
      const commercialResult = PricingTier.create(PricingTierType.COMMERCIAL);
      
      expect(retailResult.isSuccess() && commercialResult.isSuccess()).toBe(true);
      
      if (retailResult.isSuccess() && commercialResult.isSuccess()) {
        const retail = retailResult.value;
        const commercial = commercialResult.value;
        
        expect(retail.isRetail()).toBe(true);
        expect(retail.isCommercial()).toBe(false);
        
        expect(commercial.isCommercial()).toBe(true);
        expect(commercial.isRetail()).toBe(false);
      }
    });

    it('should return correct markup percentages per tier', () => {
      const guestResult = PricingTier.create(PricingTierType.GUEST);
      const retailResult = PricingTier.create(PricingTierType.RETAIL);
      const commercialResult = PricingTier.create(PricingTierType.COMMERCIAL);
      const wholesaleResult = PricingTier.create(PricingTierType.WHOLESALE);
      const importerResult = PricingTier.create(PricingTierType.IMPORTER);
      
      expect(
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ).toBe(true);
      
      if (
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ) {
        expect(guestResult.value.getBaseMarkupPercentage()).toBe(150);
        expect(retailResult.value.getBaseMarkupPercentage()).toBe(150);
        expect(commercialResult.value.getBaseMarkupPercentage()).toBe(125);
        expect(wholesaleResult.value.getBaseMarkupPercentage()).toBe(100);
        expect(importerResult.value.getBaseMarkupPercentage()).toBe(60);
      }
    });

    it('should return correct maximum discount percentages per tier', () => {
      const guestResult = PricingTier.create(PricingTierType.GUEST);
      const retailResult = PricingTier.create(PricingTierType.RETAIL);
      const commercialResult = PricingTier.create(PricingTierType.COMMERCIAL);
      const wholesaleResult = PricingTier.create(PricingTierType.WHOLESALE);
      const importerResult = PricingTier.create(PricingTierType.IMPORTER);
      
      expect(
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ).toBe(true);
      
      if (
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ) {
        expect(guestResult.value.getMaxDiscountPercentage()).toBe(15);
        expect(retailResult.value.getMaxDiscountPercentage()).toBe(20);
        expect(commercialResult.value.getMaxDiscountPercentage()).toBe(25);
        expect(wholesaleResult.value.getMaxDiscountPercentage()).toBe(30);
        expect(importerResult.value.getMaxDiscountPercentage()).toBe(15);
      }
    });

    it('should return correct floor gross margin percentages per tier', () => {
      const guestResult = PricingTier.create(PricingTierType.GUEST);
      const retailResult = PricingTier.create(PricingTierType.RETAIL);
      const commercialResult = PricingTier.create(PricingTierType.COMMERCIAL);
      const wholesaleResult = PricingTier.create(PricingTierType.WHOLESALE);
      const importerResult = PricingTier.create(PricingTierType.IMPORTER);
      
      expect(
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ).toBe(true);
      
      if (
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ) {
        expect(guestResult.value.getFloorGrossMarginPercentage()).toBe(135);
        expect(retailResult.value.getFloorGrossMarginPercentage()).toBe(130);
        expect(commercialResult.value.getFloorGrossMarginPercentage()).toBe(100);
        expect(wholesaleResult.value.getFloorGrossMarginPercentage()).toBe(70);
        expect(importerResult.value.getFloorGrossMarginPercentage()).toBe(30);
      }
    });

    it('should return correct target gross margin percentages per tier', () => {
      const guestResult = PricingTier.create(PricingTierType.GUEST);
      const retailResult = PricingTier.create(PricingTierType.RETAIL);
      const commercialResult = PricingTier.create(PricingTierType.COMMERCIAL);
      const wholesaleResult = PricingTier.create(PricingTierType.WHOLESALE);
      const importerResult = PricingTier.create(PricingTierType.IMPORTER);
      
      expect(
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ).toBe(true);
      
      if (
        guestResult.isSuccess() && 
        retailResult.isSuccess() && 
        commercialResult.isSuccess() &&
        wholesaleResult.isSuccess() && 
        importerResult.isSuccess()
      ) {
        expect(guestResult.value.getTargetGrossMarginPercentage()).toBe(140);
        expect(retailResult.value.getTargetGrossMarginPercentage()).toBe(140);
        expect(commercialResult.value.getTargetGrossMarginPercentage()).toBe(110);
        expect(wholesaleResult.value.getTargetGrossMarginPercentage()).toBe(80);
        expect(importerResult.value.getTargetGrossMarginPercentage()).toBe(40);
      }
    });
  });
});
