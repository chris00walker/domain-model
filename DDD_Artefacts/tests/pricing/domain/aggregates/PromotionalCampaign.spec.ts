import { PromotionalCampaign } from '@pricing/domain/aggregates/PromotionalCampaign';
import { PricingTier, PricingTierType } from '@pricing/domain/value-objects/PricingTier';
import { PriceModifier, ModifierType } from '@pricing/domain/value-objects/PriceModifier';
import { DateRange } from '@shared/domain/value-objects/DateRange';

describe('Pricing Domain - Aggregates', () => {
  describe('PromotionalCampaign', () => {
    // Test fixtures
    let retailTier: PricingTier;
    let wholesaleTier: PricingTier;
    let discountModifier: PriceModifier;
    let validDateRange: DateRange;
    
    beforeEach(() => {
      // Setup common test fixtures
      const retailTierResult = PricingTier.create(PricingTierType.RETAIL);
      expect(retailTierResult.isSuccess()).toBe(true);
      retailTier = retailTierResult.value;
      
      const wholesaleTierResult = PricingTier.create(PricingTierType.WHOLESALE);
      expect(wholesaleTierResult.isSuccess()).toBe(true);
      wholesaleTier = wholesaleTierResult.value;
      
      const discountModifierResult = PriceModifier.createDiscountFromPercentage(20);
      expect(discountModifierResult.isSuccess()).toBe(true);
      discountModifier = discountModifierResult.value;
      
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const dateRangeResult = DateRange.create(today, nextMonth);
      expect(dateRangeResult.isSuccess()).toBe(true);
      validDateRange = dateRangeResult.value;
    });
    
    it('should create a valid PromotionalCampaign', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1', 'product-2'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        expect(campaign.name).toBe('Summer Sale');
        expect(campaign.description).toBe('Annual summer discount event');
        expect(campaign.priceModifier).toBe(discountModifier);
        expect(campaign.dateRange).toBe(validDateRange);
        expect(campaign.applicableTiers).toContain(retailTier);
        expect(campaign.applicableProductIds).toContain('product-1');
        expect(campaign.applicableProductIds).toContain('product-2');
        expect(campaign.minimumQuantity).toBe(1);
        expect(campaign.active).toBe(true);
      }
    });
    
    it('should reject a campaign with invalid name', () => {
      const result = PromotionalCampaign.create({
        name: '', // Empty name
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1', 'product-2'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isFailure()).toBe(true);
    });
    
    it('should reject a campaign with no applicable tiers', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [], // Empty tiers
        applicableProductIds: ['product-1', 'product-2'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isFailure()).toBe(true);
    });
    
    it('should create a campaign with no product restrictions when applicable products is empty', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: [], // Empty products means applies to all
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        expect(campaign.applicableProductIds).toEqual([]);
        expect(campaign.appliesToAllProducts()).toBe(true);
      }
    });
    
    it('should reject a campaign with negative minimum quantity', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1', 'product-2'],
        minimumQuantity: -1, // Negative quantity
        active: true
      });
      
      expect(result.isFailure()).toBe(true);
    });
    
    it('should check if campaign is active based on date range', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1', 'product-2'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Current date is within the valid range, so should be active
        expect(campaign.isActive()).toBe(true);
        
        // Create a past date range
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 2);
        
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const pastDateRangeResult = DateRange.create(lastMonth, lastWeek);
        expect(pastDateRangeResult.isSuccess()).toBe(true);
        
        if (pastDateRangeResult.isSuccess()) {
          const pastDateRange = pastDateRangeResult.value;
          
          const pastCampaignResult = PromotionalCampaign.create({
            name: 'Past Campaign',
            description: 'This campaign is in the past',
            priceModifier: discountModifier,
            dateRange: pastDateRange,
            applicableTiers: [retailTier],
            applicableProductIds: ['product-1'],
            minimumQuantity: 1,
            active: true
          });
          
          expect(pastCampaignResult.isSuccess()).toBe(true);
          if (pastCampaignResult.isSuccess()) {
            const pastCampaign = pastCampaignResult.value;
            
            // Date range is in the past, so should not be active
            expect(pastCampaign.isActive()).toBe(false);
          }
        }
      }
    });
    
    it('should respect the active flag regardless of date range', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1', 'product-2'],
        minimumQuantity: 1,
        active: false // Explicitly set to inactive
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Even though date range is valid, active flag is false
        expect(campaign.isActive()).toBe(false);
      }
    });
    
    it('should check if campaign is applicable to a pricing tier', () => {
      const result = PromotionalCampaign.create({
        name: 'Retail Only Sale',
        description: 'Discount for retail customers only',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier], // Only retail tier
        applicableProductIds: ['product-1', 'product-2'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Should be applicable to retail tier
        expect(campaign.isApplicableTo(retailTier)).toBe(true);
        
        // Should not be applicable to wholesale tier
        expect(campaign.isApplicableTo(wholesaleTier)).toBe(false);
      }
    });
    
    it('should check if campaign is applicable to a product', () => {
      const result = PromotionalCampaign.create({
        name: 'Selected Products Sale',
        description: 'Discount for selected products',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1', 'product-2'], // Only these products
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Should be applicable to listed products
        expect(campaign.isApplicableToProduct('product-1')).toBe(true);
        expect(campaign.isApplicableToProduct('product-2')).toBe(true);
        
        // Should not be applicable to other products
        expect(campaign.isApplicableToProduct('product-3')).toBe(false);
      }
    });
    
    it('should check if a campaign with no product restrictions applies to all products', () => {
      const result = PromotionalCampaign.create({
        name: 'Store-wide Sale',
        description: 'Discount for all products',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: [], // Empty list means all products
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        expect(campaign.appliesToAllProducts()).toBe(true);
        
        // Should be applicable to any product
        expect(campaign.isApplicableToProduct('any-product-id')).toBe(true);
      }
    });
    
    it('should check if quantity meets minimum requirements', () => {
      const result = PromotionalCampaign.create({
        name: 'Bulk Discount',
        description: 'Discount for bulk purchases',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 5, // Minimum 5 items
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Should not be applicable to smaller quantities
        expect(campaign.meetsMinimumQuantity(4)).toBe(false);
        
        // Should be applicable to exact minimum quantity
        expect(campaign.meetsMinimumQuantity(5)).toBe(true);
        
        // Should be applicable to larger quantities
        expect(campaign.meetsMinimumQuantity(10)).toBe(true);
      }
    });
    
    it('should update campaign name and description', () => {
      const result = PromotionalCampaign.create({
        name: 'Original Name',
        description: 'Original description',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        campaign.updateDetails('New Name', 'New description');
        
        expect(campaign.name).toBe('New Name');
        expect(campaign.description).toBe('New description');
      }
    });
    
    it('should update price modifier', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier, // 20% discount
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Create a new modifier with a different discount
        const newModifierResult = PriceModifier.createDiscountFromPercentage(30);
        expect(newModifierResult.isSuccess()).toBe(true);
        
        if (newModifierResult.isSuccess()) {
          const newModifier = newModifierResult.value;
          
          campaign.updatePriceModifier(newModifier);
          
          expect(campaign.priceModifier).toBe(newModifier);
          expect(campaign.priceModifier.value).toBe(30);
        }
      }
    });
    
    it('should update date range', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Create a new date range
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        const twoMonthsLater = new Date();
        twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
        
        const newDateRangeResult = DateRange.create(twoMonthsLater, nextYear);
        expect(newDateRangeResult.isSuccess()).toBe(true);
        
        if (newDateRangeResult.isSuccess()) {
          const newDateRange = newDateRangeResult.value;
          
          campaign.updateDateRange(newDateRange);
          
          expect(campaign.dateRange).toBe(newDateRange);
        }
      }
    });
    
    it('should update applicable tiers', () => {
      const result = PromotionalCampaign.create({
        name: 'Retail Only Sale',
        description: 'Discount for retail customers only',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier], // Only retail tier initially
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Add wholesale tier to applicable tiers
        campaign.updateApplicableTiers([retailTier, wholesaleTier]);
        
        expect(campaign.applicableTiers).toContain(retailTier);
        expect(campaign.applicableTiers).toContain(wholesaleTier);
        expect(campaign.isApplicableTo(wholesaleTier)).toBe(true);
      }
    });
    
    it('should reject update with empty applicable tiers', () => {
      const result = PromotionalCampaign.create({
        name: 'Retail Only Sale',
        description: 'Discount for retail customers only',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Try to update with empty tiers array
        expect(() => campaign.updateApplicableTiers([])).toThrow();
        
        // Original tiers should remain unchanged
        expect(campaign.applicableTiers).toEqual([retailTier]);
      }
    });
    
    it('should update applicable products', () => {
      const result = PromotionalCampaign.create({
        name: 'Selected Products Sale',
        description: 'Discount for selected products',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'], // Only one product initially
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Update to include more products
        campaign.updateApplicableProducts(['product-1', 'product-2', 'product-3']);
        
        expect(campaign.applicableProductIds).toContain('product-1');
        expect(campaign.applicableProductIds).toContain('product-2');
        expect(campaign.applicableProductIds).toContain('product-3');
        expect(campaign.isApplicableToProduct('product-3')).toBe(true);
      }
    });
    
    it('should update to apply to all products', () => {
      const result = PromotionalCampaign.create({
        name: 'Selected Products Sale',
        description: 'Discount for selected products',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'], // Only specific products initially
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Update to apply to all products (empty array)
        campaign.updateApplicableProducts([]);
        
        expect(campaign.applicableProductIds).toEqual([]);
        expect(campaign.appliesToAllProducts()).toBe(true);
        expect(campaign.isApplicableToProduct('any-product')).toBe(true);
      }
    });
    
    it('should update minimum quantity', () => {
      const result = PromotionalCampaign.create({
        name: 'Bulk Discount',
        description: 'Discount for bulk purchases',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1, // Initially no minimum
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Update to require minimum 5 items
        campaign.updateMinimumQuantity(5);
        
        expect(campaign.minimumQuantity).toBe(5);
        expect(campaign.meetsMinimumQuantity(4)).toBe(false);
        expect(campaign.meetsMinimumQuantity(5)).toBe(true);
      }
    });
    
    it('should reject update with negative minimum quantity', () => {
      const result = PromotionalCampaign.create({
        name: 'Bulk Discount',
        description: 'Discount for bulk purchases',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Try to update with negative quantity
        expect(() => campaign.updateMinimumQuantity(-1)).toThrow();
        
        // Original minimum should remain unchanged
        expect(campaign.minimumQuantity).toBe(1);
      }
    });
    
    it('should activate an inactive campaign', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: false // Start inactive
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Initially inactive
        expect(campaign.isActive()).toBe(false);
        
        campaign.activate();
        
        // Should now be active
        expect(campaign.isActive()).toBe(true);
      }
    });
    
    it('should deactivate an active campaign', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 1,
        active: true // Start active
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Initially active
        expect(campaign.isActive()).toBe(true);
        
        campaign.deactivate();
        
        // Should now be inactive
        expect(campaign.isActive()).toBe(false);
      }
    });
    
    it('should check if campaign is applicable to order context', () => {
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        priceModifier: discountModifier,
        dateRange: validDateRange,
        applicableTiers: [retailTier],
        applicableProductIds: ['product-1'],
        minimumQuantity: 3, // Require minimum 3 items
        active: true
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Valid order context that meets all criteria
        const validContext = {
          pricingTier: retailTier,
          productId: 'product-1',
          quantity: 5 // Above minimum
        };
        
        // Order context with incorrect tier
        const invalidTierContext = {
          pricingTier: wholesaleTier,
          productId: 'product-1',
          quantity: 5
        };
        
        // Order context with incorrect product
        const invalidProductContext = {
          pricingTier: retailTier,
          productId: 'product-2',
          quantity: 5
        };
        
        // Order context with insufficient quantity
        const invalidQuantityContext = {
          pricingTier: retailTier,
          productId: 'product-1',
          quantity: 2 // Below minimum
        };
        
        expect(campaign.isApplicableToOrderContext(validContext)).toBe(true);
        expect(campaign.isApplicableToOrderContext(invalidTierContext)).toBe(false);
        expect(campaign.isApplicableToOrderContext(invalidProductContext)).toBe(false);
        expect(campaign.isApplicableToOrderContext(invalidQuantityContext)).toBe(false);
      }
    });
  });
});
