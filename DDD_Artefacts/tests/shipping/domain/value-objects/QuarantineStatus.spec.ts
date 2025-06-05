import { QuarantineStatus } from '../../../../src/shipping/domain/value-objects/QuarantineStatus';

describe('QuarantineStatus Value Object', () => {
  const validQuarantineProps = {
    isQuarantined: true,
    reason: 'Failed quality check',
    startDate: new Date('2025-06-01T10:00:00Z')
  };

  const validNonQuarantineProps = {
    isQuarantined: false,
    startDate: new Date('2025-06-01T10:00:00Z')
  };

  describe('create static factory method', () => {
    it('should create a valid QuarantineStatus when quarantined with reason', () => {
      // Act
      const quarantineStatusResult = QuarantineStatus.create(validQuarantineProps);

      // Assert
      expect(quarantineStatusResult.isSuccess).toBe(true);
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        expect(quarantineStatus.isQuarantined).toBe(true);
        expect(quarantineStatus.reason).toBe('Failed quality check');
        expect(quarantineStatus.startDate).toEqual(validQuarantineProps.startDate);
        expect(quarantineStatus.endDate).toBeUndefined();
      }
    });

    it('should create a valid QuarantineStatus when not quarantined', () => {
      // Act
      const quarantineStatusResult = QuarantineStatus.create(validNonQuarantineProps);

      // Assert
      expect(quarantineStatusResult.isSuccess).toBe(true);
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        expect(quarantineStatus.isQuarantined).toBe(false);
        expect(quarantineStatus.reason).toBeUndefined();
        expect(quarantineStatus.startDate).toEqual(validNonQuarantineProps.startDate);
        expect(quarantineStatus.endDate).toBeUndefined();
      }
    });

    it('should fail when quarantined but no reason provided', () => {
      // Arrange
      const invalidProps = {
        isQuarantined: true,
        startDate: new Date('2025-06-01T10:00:00Z')
      };

      // Act
      const quarantineStatusResult = QuarantineStatus.create(invalidProps);

      // Assert
      expect(quarantineStatusResult.isFailure).toBe(true);
      expect(quarantineStatusResult.getErrorValue()).toBe('Quarantine reason must be provided when a product is quarantined');
    });

    it('should fail when quarantined with empty reason', () => {
      // Arrange
      const invalidProps = {
        isQuarantined: true,
        reason: '   ',
        startDate: new Date('2025-06-01T10:00:00Z')
      };

      // Act
      const quarantineStatusResult = QuarantineStatus.create(invalidProps);

      // Assert
      expect(quarantineStatusResult.isFailure).toBe(true);
      expect(quarantineStatusResult.getErrorValue()).toBe('Quarantine reason must be provided when a product is quarantined');
    });

    it('should fail when startDate is missing', () => {
      // Arrange
      const invalidProps = {
        isQuarantined: true,
        reason: 'Failed quality check'
      };

      // Act
      const quarantineStatusResult = QuarantineStatus.create(invalidProps as any);

      // Assert
      expect(quarantineStatusResult.isFailure).toBe(true);
      expect(quarantineStatusResult.getErrorValue()).toContain('startDate');
    });

    it('should fail when endDate is before startDate', () => {
      // Arrange
      const invalidProps = {
        isQuarantined: true,
        reason: 'Failed quality check',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-05-31T10:00:00Z')
      };

      // Act
      const quarantineStatusResult = QuarantineStatus.create(invalidProps);

      // Assert
      expect(quarantineStatusResult.isFailure).toBe(true);
      expect(quarantineStatusResult.getErrorValue()).toBe('Quarantine end date must be after the start date');
    });
  });

  describe('isActive method', () => {
    it('should return true when quarantined and no end date', () => {
      // Arrange
      const quarantineStatusResult = QuarantineStatus.create(validQuarantineProps);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      
      // Act & Assert
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        expect(quarantineStatus.isActive()).toBe(true);
      }
    });

    it('should return true when quarantined and end date is in the future', () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      
      const props = {
        isQuarantined: true,
        reason: 'Failed quality check',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: futureDate
      };
      
      const quarantineStatusResult = QuarantineStatus.create(props);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      
      // Act & Assert
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        expect(quarantineStatus.isActive()).toBe(true);
      }
    });

    it('should return false when quarantined and end date is in the past', () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      
      const props = {
        isQuarantined: true,
        reason: 'Failed quality check',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: pastDate
      };
      
      const quarantineStatusResult = QuarantineStatus.create(props);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      
      // Act & Assert
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        expect(quarantineStatus.isActive()).toBe(false);
      }
    });

    it('should return false when not quarantined', () => {
      // Arrange
      const quarantineStatusResult = QuarantineStatus.create(validNonQuarantineProps);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      
      // Act & Assert
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        expect(quarantineStatus.isActive()).toBe(false);
      }
    });
  });

  describe('release method', () => {
    it('should create a new non-quarantined status with end date', () => {
      // Arrange
      const quarantineStatusResult = QuarantineStatus.create(validQuarantineProps);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      
      // Act
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        const releasedResult = quarantineStatus.release();
        
        // Assert
        expect(releasedResult.isSuccess).toBe(true);
        if (releasedResult.isSuccess) {
          const releasedStatus = releasedResult.getValue();
          expect(releasedStatus.isQuarantined).toBe(false);
          expect(releasedStatus.reason).toBeUndefined();
          expect(releasedStatus.startDate).toEqual(validQuarantineProps.startDate);
          expect(releasedStatus.endDate).toBeDefined();
          expect(releasedStatus.isActive()).toBe(false);
        }
      }
    });

    it('should fail when trying to release a non-quarantined status', () => {
      // Arrange
      const quarantineStatusResult = QuarantineStatus.create(validNonQuarantineProps);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      
      // Act
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        const releasedResult = quarantineStatus.release();
        
        // Assert
        expect(releasedResult.isFailure).toBe(true);
        expect(releasedResult.getErrorValue()).toBe('Cannot release a product that is not quarantined');
      }
    });
  });

  describe('updateReason method', () => {
    it('should create a new status with updated reason', () => {
      // Arrange
      const quarantineStatusResult = QuarantineStatus.create(validQuarantineProps);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      const newReason = 'Updated quality check failure reason';
      
      // Act
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        const updatedResult = quarantineStatus.updateReason(newReason);
        
        // Assert
        expect(updatedResult.isSuccess).toBe(true);
        if (updatedResult.isSuccess) {
          const updatedStatus = updatedResult.getValue();
          expect(updatedStatus.isQuarantined).toBe(true);
          expect(updatedStatus.reason).toBe(newReason);
          expect(updatedStatus.startDate).toEqual(validQuarantineProps.startDate);
          expect(updatedStatus.endDate).toBeUndefined();
        }
      }
    });

    it('should fail when trying to update reason for a non-quarantined status', () => {
      // Arrange
      const quarantineStatusResult = QuarantineStatus.create(validNonQuarantineProps);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      const newReason = 'This should fail';
      
      // Act
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        const updatedResult = quarantineStatus.updateReason(newReason);
        
        // Assert
        expect(updatedResult.isFailure).toBe(true);
        expect(updatedResult.getErrorValue()).toBe('Cannot update reason for a product that is not quarantined');
      }
    });

    it('should fail when trying to update with an empty reason', () => {
      // Arrange
      const quarantineStatusResult = QuarantineStatus.create(validQuarantineProps);
      expect(quarantineStatusResult.isSuccess).toBe(true);
      const emptyReason = '   ';
      
      // Act
      if (quarantineStatusResult.isSuccess) {
        const quarantineStatus = quarantineStatusResult.getValue();
        const updatedResult = quarantineStatus.updateReason(emptyReason);
        
        // Assert
        expect(updatedResult.isFailure).toBe(true);
        expect(updatedResult.getErrorValue()).toBe('Quarantine reason cannot be empty');
      }
    });
  });

  describe('equals method', () => {
    it('should return true for two identical quarantine statuses', () => {
      // Arrange
      const status1Result = QuarantineStatus.create(validQuarantineProps);
      const status2Result = QuarantineStatus.create(validQuarantineProps);
      
      expect(status1Result.isSuccess && status2Result.isSuccess).toBe(true);
      
      // Act & Assert
      if (status1Result.isSuccess && status2Result.isSuccess) {
        const status1 = status1Result.getValue();
        const status2 = status2Result.getValue();
        expect(status1.equals(status2)).toBe(true);
      }
    });

    it('should return false for different quarantine statuses', () => {
      // Arrange
      const status1Result = QuarantineStatus.create(validQuarantineProps);
      const status2Result = QuarantineStatus.create(validNonQuarantineProps);
      
      expect(status1Result.isSuccess && status2Result.isSuccess).toBe(true);
      
      // Act & Assert
      if (status1Result.isSuccess && status2Result.isSuccess) {
        const status1 = status1Result.getValue();
        const status2 = status2Result.getValue();
        expect(status1.equals(status2)).toBe(false);
      }
    });
  });
});
