import { Address } from '../../../../code/shared/domain/value-objects/Address';

describe('Address Value Object', () => {
  describe('creation', () => {
    it('should create a valid Address object', () => {
      // Arrange
      const addressProps = {
        street: '123 Main St',
        city: 'Anytown',
        country: 'US',
        state: 'CA',
        postalCode: '12345'
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isSuccess()).toBe(true);
      if (addressResult.isSuccess()) {
        expect(addressResult.value.street).toBe('123 Main St');
        expect(addressResult.value.city).toBe('Anytown');
        expect(addressResult.value.country).toBe('US');
      }
    });

    it('should reject creation with missing required fields', () => {
      // Arrange
      const addressProps = {
        street: '',
        city: 'Anytown',
        country: 'US'
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isFailure()).toBe(true);
      if (addressResult.isFailure()) {
        expect(addressResult.error).toContain('street');
      }
    });

    it('should reject creation with too short street name', () => {
      // Arrange
      const addressProps = {
        street: 'AB',  // Too short
        city: 'Anytown',
        country: 'US',
        state: 'CA'
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isFailure()).toBe(true);
      if (addressResult.isFailure()) {
        expect(addressResult.error).toContain('Street must be at least 3 characters');
      }
    });

    it('should reject creation with too long street name', () => {
      // Arrange
      const longStreet = 'A'.repeat(101);
      const addressProps = {
        street: longStreet,
        city: 'Anytown',
        country: 'US',
        state: 'CA'
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isFailure()).toBe(true);
      if (addressResult.isFailure()) {
        expect(addressResult.error).toContain('Street must not exceed 100 characters');
      }
    });

    it('should reject creation with too short city name', () => {
      // Arrange
      const addressProps = {
        street: '123 Main St',
        city: 'A',  // Too short
        country: 'US',
        state: 'CA'
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isFailure()).toBe(true);
      if (addressResult.isFailure()) {
        expect(addressResult.error).toContain('City must be at least 2 characters');
      }
    });

    it('should reject creation with too long city name', () => {
      // Arrange
      const longCity = 'A'.repeat(51);
      const addressProps = {
        street: '123 Main St',
        city: longCity,
        country: 'US',
        state: 'CA'
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isFailure()).toBe(true);
      if (addressResult.isFailure()) {
        expect(addressResult.error).toContain('City must not exceed 50 characters');
      }
    });

    it('should reject creation with missing state for US addresses', () => {
      // Arrange
      const addressProps = {
        street: '123 Main St',
        city: 'Anytown',
        country: 'US',
        // No state provided
        postalCode: '12345'
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isFailure()).toBe(true);
      if (addressResult.isFailure()) {
        expect(addressResult.error).toContain('State is required for US');
      }
    });

    it('should reject creation with invalid US postal code', () => {
      // Arrange
      const addressProps = {
        street: '123 Main St',
        city: 'Anytown',
        country: 'US',
        state: 'CA',
        postalCode: 'ABC12'  // Invalid format for US
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isFailure()).toBe(true);
      if (addressResult.isFailure()) {
        expect(addressResult.error).toContain('Invalid US postal code');
      }
    });

    it('should accept creation with valid postal code formats', () => {
      // Arrange
      const addressProps = {
        street: '123 Main St',
        city: 'Anytown',
        country: 'US',
        state: 'CA',
        postalCode: '12345-6789'  // Valid extended format
      };

      // Act
      const addressResult = Address.create(addressProps);

      // Assert
      expect(addressResult.isSuccess()).toBe(true);
    });
  });

  describe('formatting', () => {
    it('should format address correctly with all fields', () => {
      // Arrange
      const addressProps = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        additionalInfo: 'Suite 101'
      };

      // Act
      const addressResult = Address.create(addressProps);
      if (addressResult.isSuccess()) {
        const address = addressResult.value;
        const formattedAddress = address.toString();

        // Assert
        expect(formattedAddress).toBe('123 Main St, Anytown, CA 12345, US (Suite 101)');
      }
    });

    it('should format address correctly with minimal fields', () => {
      // Arrange
      const addressProps = {
        street: '123 Main St',
        city: 'Anytown',
        country: 'France'
      };

      // Act
      const addressResult = Address.create(addressProps);
      if (addressResult.isSuccess()) {
        const address = addressResult.value;
        const formattedAddress = address.toString();

        // Assert
        expect(formattedAddress).toBe('123 Main St, Anytown, France');
      }
    });
  });
});
