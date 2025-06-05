import { CustomerSegment } from '../../../../src/customers/domain/value-objects/CustomerSegment';
import { CustomerSegmentType } from '../../../../src/customers/domain/value-objects/CustomerSegmentType';
import { CustomerType } from '../../../../src/customers/domain/value-objects/CustomerType';

describe('CustomerSegment', () => {
  const validProps = {
    segmentType: CustomerSegmentType.DiasporaEstablished,
    customerType: CustomerType.DiasporaCommunity,
    acquisitionDate: new Date('2023-01-15'),
    acquisitionChannel: 'Website',
    lifetimeValue: 1250.50,
    engagementScore: 85,
    preferredCommunicationChannel: 'Email',
    lastSegmentChange: new Date('2023-06-20')
  };

  describe('create', () => {
    it('should create a valid CustomerSegment', () => {
      const result = CustomerSegment.create(validProps);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const segment = result.value;
        expect(segment.segmentType).toBe(CustomerSegmentType.DiasporaEstablished);
        expect(segment.customerType).toBe(CustomerType.DiasporaCommunity);
        expect(segment.acquisitionDate).toEqual(validProps.acquisitionDate);
        expect(segment.acquisitionChannel).toBe('Website');
        expect(segment.lifetimeValue).toBe(1250.50);
        expect(segment.engagementScore).toBe(85);
        expect(segment.preferredCommunicationChannel).toBe('Email');
        expect(segment.lastSegmentChange).toEqual(validProps.lastSegmentChange);
      }
    });

    it('should create a valid CustomerSegment without optional properties', () => {
      const props = {
        segmentType: CustomerSegmentType.DiasporaEstablished,
        customerType: CustomerType.DiasporaCommunity,
        acquisitionDate: new Date('2023-01-15'),
        acquisitionChannel: 'Website',
        lifetimeValue: 1250.50,
        engagementScore: 85
      };

      const result = CustomerSegment.create(props);
      
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const segment = result.value;
        expect(segment.preferredCommunicationChannel).toBeUndefined();
        expect(segment.lastSegmentChange).toBeUndefined();
      }
    });

    it('should fail when required properties are missing', () => {
      const props = {
        segmentType: CustomerSegmentType.DiasporaEstablished,
        customerType: CustomerType.DiasporaCommunity,
        acquisitionDate: new Date('2023-01-15'),
        // Missing acquisitionChannel
        lifetimeValue: 1250.50,
        engagementScore: 85
      };

      // @ts-ignore - Intentionally testing with missing property
      const result = CustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('acquisitionChannel');
    });

    it('should fail when acquisition channel is empty', () => {
      const props = {
        ...validProps,
        acquisitionChannel: '   '
      };

      const result = CustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Acquisition channel cannot be empty');
    });

    it('should fail when lifetime value is negative', () => {
      const props = {
        ...validProps,
        lifetimeValue: -100
      };

      const result = CustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Lifetime value cannot be negative');
    });

    it('should fail when engagement score is below 0', () => {
      const props = {
        ...validProps,
        engagementScore: -10
      };

      const result = CustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Engagement score must be between 0 and 100');
    });

    it('should fail when engagement score is above 100', () => {
      const props = {
        ...validProps,
        engagementScore: 110
      };

      const result = CustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Engagement score must be between 0 and 100');
    });

    it('should fail when segment type is not valid for customer type', () => {
      const props = {
        ...validProps,
        segmentType: CustomerSegmentType.FoodTruckStartup, // Food truck segment
        customerType: CustomerType.DiasporaCommunity // Diaspora customer type
      };

      const result = CustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('is not valid for customer type');
    });

    it('should fail when lastSegmentChange is before acquisitionDate', () => {
      const props = {
        ...validProps,
        acquisitionDate: new Date('2023-01-15'),
        lastSegmentChange: new Date('2022-12-01') // Before acquisition date
      };

      const result = CustomerSegment.create(props);
      
      expect(result.isFailure()).toBe(true);
      expect(result.getErrorValue()).toContain('Last segment change date cannot be before acquisition date');
    });
  });

  describe('updateEngagementScore', () => {
    it('should update the engagement score', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateEngagementScore(95);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.engagementScore).toBe(95);
          // Other properties should remain unchanged
          expect(updatedResult.value.segmentType).toBe(segment.segmentType);
          expect(updatedResult.value.lifetimeValue).toBe(segment.lifetimeValue);
        }
      }
    });

    it('should fail when new engagement score is invalid', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateEngagementScore(105);
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Engagement score must be between 0 and 100');
      }
    });
  });

  describe('updateLifetimeValue', () => {
    it('should update the lifetime value', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateLifetimeValue(2000);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.lifetimeValue).toBe(2000);
          // Other properties should remain unchanged
          expect(updatedResult.value.segmentType).toBe(segment.segmentType);
          expect(updatedResult.value.engagementScore).toBe(segment.engagementScore);
        }
      }
    });

    it('should fail when new lifetime value is negative', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.updateLifetimeValue(-500);
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Lifetime value cannot be negative');
      }
    });
  });

  describe('changeSegmentType', () => {
    it('should change the segment type within the same customer type', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.changeSegmentType(CustomerSegmentType.DiasporaNewArrival);
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.segmentType).toBe(CustomerSegmentType.DiasporaNewArrival);
          expect(updatedResult.value.lastSegmentChange).toBeDefined();
          // Other properties should remain unchanged
          expect(updatedResult.value.customerType).toBe(segment.customerType);
          expect(updatedResult.value.lifetimeValue).toBe(segment.lifetimeValue);
        }
      }
    });

    it('should fail when new segment type is not valid for customer type', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.changeSegmentType(CustomerSegmentType.FoodTruckStartup);
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('is not valid for customer type');
      }
    });
  });

  describe('setPreferredCommunicationChannel', () => {
    it('should set the preferred communication channel', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.setPreferredCommunicationChannel('SMS');
        
        expect(updatedResult.isSuccess()).toBe(true);
        if (updatedResult.isSuccess()) {
          expect(updatedResult.value.preferredCommunicationChannel).toBe('SMS');
          // Other properties should remain unchanged
          expect(updatedResult.value.segmentType).toBe(segment.segmentType);
          expect(updatedResult.value.lifetimeValue).toBe(segment.lifetimeValue);
        }
      }
    });

    it('should fail when communication channel is empty', () => {
      const segmentResult = CustomerSegment.create(validProps);
      expect(segmentResult.isSuccess()).toBe(true);
      
      if (segmentResult.isSuccess()) {
        const segment = segmentResult.value;
        const updatedResult = segment.setPreferredCommunicationChannel('  ');
        
        expect(updatedResult.isFailure()).toBe(true);
        expect(updatedResult.getErrorValue()).toContain('Communication channel cannot be empty');
      }
    });
  });

  describe('value object equality', () => {
    it('should consider two segments with the same properties as equal', () => {
      const segment1Result = CustomerSegment.create(validProps);
      const segment2Result = CustomerSegment.create(validProps);
      
      expect(segment1Result.isSuccess()).toBe(true);
      expect(segment2Result.isSuccess()).toBe(true);
      
      if (segment1Result.isSuccess() && segment2Result.isSuccess()) {
        const segment1 = segment1Result.value;
        const segment2 = segment2Result.value;
        
        expect(segment1.equals(segment2)).toBe(true);
      }
    });

    it('should consider segments with different properties as not equal', () => {
      const segment1Result = CustomerSegment.create(validProps);
      const segment2Result = CustomerSegment.create({
        ...validProps,
        engagementScore: 90
      });
      
      expect(segment1Result.isSuccess()).toBe(true);
      expect(segment2Result.isSuccess()).toBe(true);
      
      if (segment1Result.isSuccess() && segment2Result.isSuccess()) {
        const segment1 = segment1Result.value;
        const segment2 = segment2Result.value;
        
        expect(segment1.equals(segment2)).toBe(false);
      }
    });
  });
});
