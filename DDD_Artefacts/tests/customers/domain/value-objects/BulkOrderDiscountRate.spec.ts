import { BulkOrderDiscountRate } from '../../../../src/customers/domain/value-objects/BulkOrderDiscountRate';

describe('BulkOrderDiscountRate', () => {
  // Valid test data
  const validProps = {
    minimumQuantity: 10,
    discountPercentage: 15,
    customerSegmentId: 'segment-123',
    minimumOrderValue: 500,
    maxDiscountAmount: 200,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isStackable: true
  };

  describe('creation', () => {
    it('should create a valid bulk order discount rate', () => {
      const result = BulkOrderDiscountRate.create(validProps);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const discountRate = result.value;
        expect(discountRate.minimumQuantity).toBe(10);
        expect(discountRate.discountPercentage).toBe(15);
        expect(discountRate.customerSegmentId).toBe('segment-123');
        expect(discountRate.minimumOrderValue).toBe(500);
        expect(discountRate.maxDiscountAmount).toBe(200);
        expect(discountRate.isStackable).toBe(true);
      }
    });

    it('should create a valid bulk order discount rate with only required properties', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 5,
        discountPercentage: 10
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const discountRate = result.value;
        expect(discountRate.minimumQuantity).toBe(5);
        expect(discountRate.discountPercentage).toBe(10);
        expect(discountRate.customerSegmentId).toBeUndefined();
        expect(discountRate.minimumOrderValue).toBeUndefined();
        expect(discountRate.maxDiscountAmount).toBeUndefined();
        expect(discountRate.isStackable).toBe(false);
      }
    });

    it('should fail when minimumQuantity is missing', () => {
      const result = BulkOrderDiscountRate.create({
        //@ts-ignore - Testing invalid input
        minimumQuantity: null,
        discountPercentage: 15
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('minimumQuantity');
    });

    it('should fail when discountPercentage is missing', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        //@ts-ignore - Testing invalid input
        discountPercentage: undefined
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('discountPercentage');
    });

    it('should fail when minimumQuantity is zero or negative', () => {
      let result = BulkOrderDiscountRate.create({
        minimumQuantity: 0,
        discountPercentage: 15
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Minimum quantity must be greater than zero');

      result = BulkOrderDiscountRate.create({
        minimumQuantity: -5,
        discountPercentage: 15
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Minimum quantity must be greater than zero');
    });

    it('should fail when discountPercentage is negative', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: -5
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Discount percentage cannot be negative');
    });

    it('should fail when discountPercentage is greater than 100', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 120
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Discount percentage cannot be greater than 100');
    });

    it('should fail when minimumOrderValue is negative', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        minimumOrderValue: -100
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Minimum order value cannot be negative');
    });

    it('should fail when maxDiscountAmount is negative', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        maxDiscountAmount: -50
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Maximum discount amount cannot be negative');
    });

    it('should fail when startDate is after endDate', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        startDate: new Date('2025-12-31'),
        endDate: new Date('2025-01-01')
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Start date cannot be after end date');
    });

    it('should fail when customerSegmentId is empty string', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        customerSegmentId: '  '
      });
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Customer segment ID cannot be empty');
    });
  });

  describe('isActive', () => {
    it('should return true when no dates are specified', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.isActive).toBe(true);
      }
    });

    it('should return true when current date is within range', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        startDate: yesterday,
        endDate: tomorrow
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.isActive).toBe(true);
      }
    });

    it('should return false when current date is before start date', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        startDate: tomorrow,
        endDate: dayAfterTomorrow
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.isActive).toBe(false);
      }
    });

    it('should return false when current date is after end date', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        startDate: twoDaysAgo,
        endDate: yesterday
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.isActive).toBe(false);
      }
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const discountRate = result.value;
        // 20 items at $50 each = $1000 total
        // 15% discount on $1000 = $150
        expect(discountRate.calculateDiscount(20, 50)).toBe(150);
      }
    });

    it('should return 0 when quantity is less than minimum', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const discountRate = result.value;
        expect(discountRate.calculateDiscount(5, 50)).toBe(0);
      }
    });

    it('should return 0 when total value is less than minimum order value', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        minimumOrderValue: 1000
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const discountRate = result.value;
        // 15 items at $50 each = $750 total, which is below minimum order value
        expect(discountRate.calculateDiscount(15, 50)).toBe(0);
      }
    });

    it('should cap discount at maxDiscountAmount', () => {
      const result = BulkOrderDiscountRate.create({
        minimumQuantity: 10,
        discountPercentage: 15,
        maxDiscountAmount: 100
      });
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const discountRate = result.value;
        // 20 items at $50 each = $1000 total
        // 15% discount on $1000 = $150, but capped at $100
        expect(discountRate.calculateDiscount(20, 50)).toBe(100);
      }
    });
  });

  describe('update methods', () => {
    it('should update discount percentage', () => {
      const result = BulkOrderDiscountRate.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const discountRate = result.value;
        const updatedResult = discountRate.updateDiscountPercentage(20);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.discountPercentage).toBe(20);
          // Other properties should remain the same
          expect(updatedResult.value.minimumQuantity).toBe(validProps.minimumQuantity);
          expect(updatedResult.value.customerSegmentId).toBe(validProps.customerSegmentId);
        }
      }
    });

    it('should update minimum quantity', () => {
      const result = BulkOrderDiscountRate.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const discountRate = result.value;
        const updatedResult = discountRate.updateMinimumQuantity(15);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.minimumQuantity).toBe(15);
          // Other properties should remain the same
          expect(updatedResult.value.discountPercentage).toBe(validProps.discountPercentage);
          expect(updatedResult.value.customerSegmentId).toBe(validProps.customerSegmentId);
        }
      }
    });

    it('should update validity period', () => {
      const result = BulkOrderDiscountRate.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const discountRate = result.value;
        const newStartDate = new Date('2026-01-01');
        const newEndDate = new Date('2026-12-31');
        
        const updatedResult = discountRate.updateValidityPeriod(newStartDate, newEndDate);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.startDate?.getTime()).toBe(newStartDate.getTime());
          expect(updatedResult.value.endDate?.getTime()).toBe(newEndDate.getTime());
          // Other properties should remain the same
          expect(updatedResult.value.minimumQuantity).toBe(validProps.minimumQuantity);
          expect(updatedResult.value.discountPercentage).toBe(validProps.discountPercentage);
        }
      }
    });

    it('should update max discount amount', () => {
      const result = BulkOrderDiscountRate.create(validProps);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const discountRate = result.value;
        const updatedResult = discountRate.updateMaxDiscountAmount(300);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.maxDiscountAmount).toBe(300);
          // Other properties should remain the same
          expect(updatedResult.value.minimumQuantity).toBe(validProps.minimumQuantity);
          expect(updatedResult.value.discountPercentage).toBe(validProps.discountPercentage);
        }
      }
    });
  });
});
