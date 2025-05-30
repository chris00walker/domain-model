import { SegmentPricingConfig } from '@pricing/domain/aggregates/SegmentPricingConfig';
import { PricingTier, PricingTierType } from '@pricing/domain/value-objects/PricingTier';
import { MarkupPercentage } from '@pricing/domain/value-objects/MarkupPercentage';
import { DiscountPercentage } from '@pricing/domain/value-objects/DiscountPercentage';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

describe('Pricing Domain - Aggregates', () => {
  describe('SegmentPricingConfig', () => {
    // Test fixtures
    let retailTier: PricingTier;
    let markupPercentage: MarkupPercentage;
    let discountPercentage: DiscountPercentage;
    let defaultPricingStrategyId: string;
    let now: Date;
    
    beforeEach(() => {
      // Setup common test fixtures
      const tierResult = PricingTier.create(PricingTierType.RETAIL);
      expect(tierResult.isSuccess()).toBe(true);
      retailTier = tierResult.value;
      
      const markupResult = MarkupPercentage.create(50);
      expect(markupResult.isSuccess()).toBe(true);
      markupPercentage = markupResult.value;
      
      const discountResult = DiscountPercentage.create(20);
      expect(discountResult.isSuccess()).toBe(true);
      discountPercentage = discountResult.value;
      
      defaultPricingStrategyId = 'strategy-1';
      now = new Date();
    });
    
    it('should create a valid SegmentPricingConfig', () => {
      const result = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        notes: 'Test config',
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const config = result.value;
        expect(config.pricingTier).toBe(retailTier);
        expect(config.baseMarkupPercentage).toBe(markupPercentage);
        expect(config.maxDiscountPercentage).toBe(discountPercentage);
        expect(config.floorGrossMarginPercentage).toBe(25);
        expect(config.targetGrossMarginPercentage).toBe(30);
        expect(config.defaultPricingStrategy).toBe(defaultPricingStrategyId);
        expect(config.notes).toBe('Test config');
        expect(config.isActive).toBe(true);
        expect(config.createdAt).toBe(now);
        expect(config.updatedAt).toBe(now);
      }
    });
    
    it('should create a default SegmentPricingConfig based on pricing tier', () => {
      const result = SegmentPricingConfig.createDefault(
        retailTier,
        defaultPricingStrategyId
      );
      
      // Log the error message if the result is a failure
      if (result.isFailure()) {
        console.error(`SegmentPricingConfig.createDefault failed: ${result.error}`);
      }
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const config = result.value;
        expect(config.pricingTier).toBe(retailTier);
        expect(config.defaultPricingStrategy).toBe(defaultPricingStrategyId);
        expect(config.isActive).toBe(true);
        
        // Default values should come from the pricing tier
        expect(config.baseMarkupPercentage.value).toBe(retailTier.getBaseMarkupPercentage());
        expect(config.maxDiscountPercentage.value).toBe(retailTier.getMaxDiscountPercentage());
        expect(config.floorGrossMarginPercentage).toBe(retailTier.getFloorGrossMarginPercentage());
        expect(config.targetGrossMarginPercentage).toBe(retailTier.getTargetGrossMarginPercentage());
      }
    });
    
    it('should reject configuration with invalid margin percentages', () => {
      const result = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: -10, // Invalid negative percentage
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(result.isFailure()).toBe(true);
    });
    
    it('should reject configuration with target margin lower than floor margin', () => {
      const result = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 30,
        targetGrossMarginPercentage: 25, // Lower than floor margin
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(result.isFailure()).toBe(true);
    });
    
    it('should update markup percentage', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        const newMarkupResult = MarkupPercentage.create(75);
        expect(newMarkupResult.isSuccess()).toBe(true);
        
        if (newMarkupResult.isSuccess()) {
          const newMarkup = newMarkupResult.value;
          config.updateMarkupPercentage(newMarkup);
          
          expect(config.baseMarkupPercentage).toBe(newMarkup);
          expect(config.baseMarkupPercentage.value).toBe(75);
          expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
        }
      }
    });
    
    it('should update discount percentage', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        const newDiscountResult = DiscountPercentage.create(15);
        expect(newDiscountResult.isSuccess()).toBe(true);
        
        if (newDiscountResult.isSuccess()) {
          const newDiscount = newDiscountResult.value;
          config.updateMaxDiscountPercentage(newDiscount);
          
          expect(config.maxDiscountPercentage).toBe(newDiscount);
          expect(config.maxDiscountPercentage.value).toBe(15);
          expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
        }
      }
    });
    
    it('should update margin percentages with valid values', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        const updateResult = config.updateMarginPercentages(35, 40);
        
        expect(updateResult.isSuccess()).toBe(true);
        expect(config.floorGrossMarginPercentage).toBe(35);
        expect(config.targetGrossMarginPercentage).toBe(40);
        expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
      }
    });
    
    it('should reject margin updates with invalid values', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        
        // Test with negative floor margin
        const updateResult1 = config.updateMarginPercentages(-5, 30);
        expect(updateResult1.isFailure()).toBe(true);
        
        // Test with target margin lower than floor margin
        const updateResult2 = config.updateMarginPercentages(40, 35);
        expect(updateResult2.isFailure()).toBe(true);
        
        // Original values should be unchanged
        expect(config.floorGrossMarginPercentage).toBe(25);
        expect(config.targetGrossMarginPercentage).toBe(30);
      }
    });
    
    it('should update default pricing strategy', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        const newStrategyId = 'strategy-2';
        
        config.updateDefaultPricingStrategy(newStrategyId);
        
        expect(config.defaultPricingStrategy).toBe(newStrategyId);
        expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
      }
    });
    
    it('should update notes', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        notes: 'Original notes',
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        const newNotes = 'Updated notes';
        
        config.updateNotes(newNotes);
        
        expect(config.notes).toBe(newNotes);
        expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
      }
    });
    
    it('should clear notes when passing undefined', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        notes: 'Original notes',
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        
        config.updateNotes(undefined);
        
        expect(config.notes).toBeUndefined();
        expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
      }
    });
    
    it('should activate a deactivated config', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: false, // Start deactivated
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        
        config.activate();
        
        expect(config.isActive).toBe(true);
        expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
      }
    });
    
    it('should deactivate an active config', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true, // Start activated
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        
        config.deactivate();
        
        expect(config.isActive).toBe(false);
        expect(config.updatedAt).not.toBe(now); // Should have updated timestamp
      }
    });
    
    it('should check if config is valid for a pricing tier', () => {
      const configResult = SegmentPricingConfig.create({
        pricingTier: retailTier,
        baseMarkupPercentage: markupPercentage,
        maxDiscountPercentage: discountPercentage,
        floorGrossMarginPercentage: 25,
        targetGrossMarginPercentage: 30,
        defaultPricingStrategy: defaultPricingStrategyId,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      expect(configResult.isSuccess()).toBe(true);
      if (configResult.isSuccess()) {
        const config = configResult.value;
        
        // Same tier should be valid
        expect(config.isValidForTier(retailTier)).toBe(true);
        
        // Different tier should be invalid
        const commercialTierResult = PricingTier.create(PricingTierType.COMMERCIAL);
        expect(commercialTierResult.isSuccess()).toBe(true);
        if (commercialTierResult.isSuccess()) {
          const commercialTier = commercialTierResult.value;
          expect(config.isValidForTier(commercialTier)).toBe(false);
        }
      }
    });
  });
});
