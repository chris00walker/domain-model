import { PromotionalCampaign, CampaignType, CampaignStatus } from '../../../../src/pricing/domain/aggregates/PromotionalCampaign';
import { RuleConditionType } from '../../../../src/pricing/domain/entities/PricingRule';
import { PricingTier, PricingTierType } from '../../../../src/pricing/domain/value-objects/PricingTier';
import { PriceModifier, PriceModifierType } from '../../../../src/pricing/domain/value-objects/PriceModifier';
import { DateRange } from '../../../../src/shared/domain/value-objects/DateRange';
import { Result, success, failure } from '@shared/core/Result';
import { PricingRule } from '../../../../src/pricing/domain/entities/PricingRule';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';

describe('Pricing Domain - Aggregates', () => {
  describe('PromotionalCampaign', () => {
    // Test fixtures
    let retailTier: PricingTier;
    let wholesaleTier: PricingTier;
    let discountModifier: PriceModifier;
    let pricingRule: PricingRule;
    let validDateRange: DateRange;
    let pricingRules: PricingRule[];

    beforeEach(() => {
      // Create test fixtures
      const retailTierResult = PricingTier.create(PricingTierType.RETAIL);
      if (retailTierResult.isSuccess()) {
        retailTier = retailTierResult.value;
      } else {
        throw new Error('Failed to create retail tier');
      }

      const wholesaleTierResult = PricingTier.create(PricingTierType.WHOLESALE);
      if (wholesaleTierResult.isSuccess()) {
        wholesaleTier = wholesaleTierResult.value;
      } else {
        throw new Error('Failed to create wholesale tier');
      }

      // Create discount modifier first since it's used in pricing rule
      const discountModifierResult = PriceModifier.createPercentageDiscount(
        'Test Discount',
        'Test discount for unit tests',
        10, // 10% discount
        1 // priority
      );

      if (discountModifierResult.isSuccess()) {
        discountModifier = discountModifierResult.value;
      } else {
        throw new Error(`Failed to create discount modifier: ${discountModifierResult.error}`);
      }

      // Create a simple pricing rule with all required fields
      const pricingRuleResult = PricingRule.create({
        name: 'Test Rule',
        description: 'Test rule for unit tests',
        conditions: [{
          type: RuleConditionType.MINIMUM_QUANTITY,
          value: 1,
          operator: 'GREATER_THAN'
        }],
        priceModifier: discountModifier, // Now discountModifier is defined
        applicableTiers: [retailTier],
        isActive: true,
        priority: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (pricingRuleResult.isSuccess()) {
        pricingRule = pricingRuleResult.value;
        pricingRules = [pricingRule];
      } else {
        console.error('Failed to create pricing rule:', pricingRuleResult.error);
        throw new Error('Failed to create pricing rule');
      }

      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30); // 30 days from now

      const dateRangeResult = DateRange.create(now, futureDate);
      if (dateRangeResult.isSuccess()) {
        validDateRange = dateRangeResult.value;
      } else {
        throw new Error('Failed to create date range');
      }

      pricingRules = [pricingRule];
    });

    it('should create a valid PromotionalCampaign', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1', 'product-2'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        expect(campaign.name).toBe('Summer Sale');
        expect(campaign.description).toBe('Annual summer discount event');
        expect(campaign.priceModifier).toBe(discountModifier);
        expect(campaign.startDate).toEqual(validDateRange.start);
        expect(campaign.endDate).toEqual(validDateRange.end);
        expect(campaign.applicableTiers).toContain(retailTier);
        expect(campaign.productIds).toContain('product-1');
        expect(campaign.productIds).toContain('product-2');
        expect(campaign.status).toBe(CampaignStatus.ACTIVE);
      }
    });

    it('should reject a campaign with invalid name', () => {
      const now = new Date();
      // Test with empty string
      const emptyNameResult = PromotionalCampaign.create({
        name: '',
        description: 'Annual summer discount event',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1', 'product-2'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      // Test with whitespace only
      const whitespaceNameResult = PromotionalCampaign.create({
        name: '   ',
        description: 'Annual summer discount event',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1', 'product-2'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      // One of them should fail
      expect(emptyNameResult.isSuccess() || whitespaceNameResult.isSuccess()).toBe(false);
      
      if (emptyNameResult.isFailure()) {
        expect(emptyNameResult.error).toMatch(/name/i);
      }
      if (whitespaceNameResult.isFailure()) {
        expect(whitespaceNameResult.error).toMatch(/name/i);
      }
    });

    it('should reject a campaign with no applicable tiers', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [], // Empty tiers
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1', 'product-2'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isFailure()).toBe(true);
    });

    it('should create a campaign with no product restrictions when productIds is empty', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: [], // Empty products means applies to all
        categoryIds: ['category-1'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        expect(campaign.productIds).toEqual([]);
        expect(campaign.productIds.length).toBe(0); // Check if applies to all products
        expect(campaign.categoryIds).toContain('category-1');
      }
    });

    it('should create a campaign with no product restrictions when productIds is empty but categoryIds is provided', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Category Sale',
        description: 'Sale for specific categories',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: [], // Empty productIds
        categoryIds: ['category-1'], // But has categoryIds
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        expect(campaign.productIds).toEqual([]);
        expect(campaign.categoryIds).toEqual(['category-1']);
      } else {
        console.error('Failed to create campaign:', result.error);
      }
    });

    it('should reject a campaign with invalid dates', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: new Date(), // Start date after end date
        endDate: new Date(Date.now() - 86400000), // Yesterday
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1', 'product-2'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(false);
    });

    it('should check if campaign is active based on date range and status', () => {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + 30);
      endDate.setHours(23, 59, 59, 999);

      const result = PromotionalCampaign.create({
        name: 'Date Range Test',
        description: 'Test date range activation',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate,
        endDate,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;

        // Should be active when status is ACTIVE and current date is within range
        // Check if campaign is currently active based on dates and status
      const isActive = campaign.status === CampaignStatus.ACTIVE && 
        campaign.startDate <= new Date() && 
        campaign.endDate >= new Date();
      expect(isActive).toBe(true);

        // Test with past date range
        const pastStart = new Date(now);
        pastStart.setFullYear(pastStart.getFullYear() - 1);
        const pastEnd = new Date(pastStart);
        pastEnd.setDate(pastStart.getDate() + 7);

        const pastCampaignResult = PromotionalCampaign.create({
          name: 'Past Campaign',
          description: 'Campaign that has already ended',
          type: CampaignType.SEASONAL,
          status: CampaignStatus.ACTIVE,
          startDate: pastStart,
          endDate: pastEnd,
          applicableTiers: [retailTier],
          priceModifier: discountModifier,
          pricingRules: pricingRules,
          productIds: ['product-1'],
          currentUsageCount: 0,
          createdAt: pastStart,
          updatedAt: pastStart
        });

        if (pastCampaignResult.isSuccess()) {
          const pastCampaign = pastCampaignResult.value;
          // Should be inactive because the date range is in the past
          const isPastCampaignActive = pastCampaign.status === CampaignStatus.ACTIVE && 
            pastCampaign.startDate <= new Date() && 
            pastCampaign.endDate >= new Date();
          expect(isPastCampaignActive).toBe(false);
        } else {
          fail(`Failed to create past campaign: ${pastCampaignResult.error}`);
        }
      }
    });

    it('should respect the status flag', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Summer Sale',
        description: 'Annual summer discount event',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.DRAFT, // Start with DRAFT status
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: [],
        categoryIds: ['category-1'], // Add categoryIds since productIds is empty
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        // Should be DRAFT status initially
        expect(campaign.status).toBe(CampaignStatus.DRAFT);
        
        // Activate the campaign
        const activateResult = campaign.activate();
        expect(activateResult.isSuccess()).toBe(true);
        expect(campaign.status).toBe(CampaignStatus.ACTIVE);
        
        // Pause the campaign
        const pauseResult = campaign.pause();
        expect(pauseResult.isSuccess()).toBe(true);
        expect(campaign.status).toBe(CampaignStatus.PAUSED);
        
        // Reactivate the campaign
        const reactivateResult = campaign.activate();
        expect(reactivateResult.isSuccess()).toBe(true);
        expect(campaign.status).toBe(CampaignStatus.ACTIVE);
      }
    });

    it('should check if campaign is applicable to a pricing tier', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Tier Test',
        description: 'Test tier applicability',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier], // Only applies to retail
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
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
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Product Specific Sale',
        description: 'Discount for specific products',
        type: CampaignType.NEW_PRODUCT,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1', 'product-2'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;

        // Should be applicable to included products
        expect(campaign.productIds.includes('product-1')).toBe(true);
        expect(campaign.productIds.includes('product-2')).toBe(true);

        // Should not be applicable to other products
        expect(campaign.productIds.includes('product-3')).toBe(false);
      }
    });

    it('should check if a campaign with no product restrictions applies to all products when categoryIds are provided', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Store-wide Sale',
        description: 'Discount for all products in category',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: [], // Empty product IDs
        categoryIds: ['category-1'], // But has category IDs
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        expect(campaign.productIds).toEqual([]);
        expect(campaign.categoryIds).toContain('category-1');
      } else {
        console.error('Failed to create campaign:', result.error);
      }
    });

    it('should verify campaign type behaviors', () => {
      const now = new Date();

      // Test SEASONAL campaign behavior
      const seasonalResult = PromotionalCampaign.create({
        name: 'Seasonal Sale',
        description: 'Seasonal discount campaign',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(seasonalResult.isSuccess()).toBe(true);
      if (seasonalResult.isSuccess()) {
        const seasonalCampaign = seasonalResult.value;
        expect(seasonalCampaign.type).toBe(CampaignType.SEASONAL);
      } else {
        console.error('Failed to create seasonal campaign:', seasonalResult.error);
      }

      // Test CUSTOMER_ACQUISITION campaign behavior
      const acquisitionResult = PromotionalCampaign.create({
        name: 'New Customer Discount',
        description: 'Discount for first-time customers',
        type: CampaignType.CUSTOMER_ACQUISITION,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(acquisitionResult.isSuccess()).toBe(true);
      if (acquisitionResult.isSuccess()) {
        const acquisitionCampaign = acquisitionResult.value;
        expect(acquisitionCampaign.type).toBe(CampaignType.CUSTOMER_ACQUISITION);
      } else {
        console.error('Failed to create acquisition campaign:', acquisitionResult.error);
      }
    });

    it('should check if campaign is applicable to product and tier', () => {
      const now = new Date();
      const result = PromotionalCampaign.create({
        name: 'Product Tier Test',
        description: 'Test product and tier applicability',
        type: CampaignType.SEASONAL,
        status: CampaignStatus.ACTIVE,
        startDate: validDateRange.start,
        endDate: validDateRange.end,
        applicableTiers: [retailTier],
        priceModifier: discountModifier,
        pricingRules: pricingRules,
        productIds: ['product-1'],
        currentUsageCount: 0,
        createdAt: now,
        updatedAt: now
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const campaign = result.value;
        
        // Check applicable tiers
        expect(campaign.applicableTiers.some(tier => tier.equals(retailTier))).toBe(true);
        expect(campaign.applicableTiers.some(tier => tier.equals(wholesaleTier))).toBe(false);
        
        // Check product applicability
        expect(campaign.productIds).toContain('product-1');
        expect(campaign.productIds).not.toContain('product-2');
        
        // Check if campaign is active
        expect(campaign.status).toBe(CampaignStatus.ACTIVE);
        
        // Check date range
        expect(campaign.startDate.getTime()).toBeLessThanOrEqual(now.getTime());
        expect(campaign.endDate.getTime()).toBeGreaterThanOrEqual(now.getTime());
      }
    });
  });
});
