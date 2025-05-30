import { Quantity, UnitOfMeasure } from '../../../../code/shared/domain/value-objects/Quantity';

describe('Quantity Value Object', () => {
  describe('creation', () => {
    it('should create a valid Quantity object', () => {
      // Arrange & Act
      const quantityResult = Quantity.create(100, UnitOfMeasure.GRAM);
      
      // Assert
      expect(quantityResult.isSuccess()).toBe(true);
      if (quantityResult.isSuccess()) {
        expect(quantityResult.value.value).toBe(100);
        expect(quantityResult.value.unit).toBe(UnitOfMeasure.GRAM);
      }
    });

    it('should create a valid Quantity with zero value', () => {
      // Arrange & Act
      const quantityResult = Quantity.create(0, UnitOfMeasure.PIECE);
      
      // Assert
      expect(quantityResult.isSuccess()).toBe(true);
      if (quantityResult.isSuccess()) {
        expect(quantityResult.value.value).toBe(0);
      }
    });

    it('should reject creation with negative values', () => {
      // Arrange & Act
      const quantityResult = Quantity.create(-10, UnitOfMeasure.KILOGRAM);
      
      // Assert
      expect(quantityResult.isFailure()).toBe(true);
      if (quantityResult.isFailure()) {
        expect(quantityResult.error).toContain('cannot be negative');
      }
    });

    it('should reject creation with invalid unit of measure', () => {
      // Arrange & Act
      // @ts-ignore - Intentionally testing invalid value
      const quantityResult = Quantity.create(10, 'INVALID_UNIT');
      
      // Assert
      expect(quantityResult.isFailure()).toBe(true);
      if (quantityResult.isFailure()) {
        expect(quantityResult.error).toContain('Invalid unit');
      }
    });
  });

  describe('operations', () => {
    it('should add quantities with the same unit', () => {
      // Arrange
      const quantity1 = Quantity.create(100, UnitOfMeasure.GRAM).value;
      const quantity2 = Quantity.create(50, UnitOfMeasure.GRAM).value;
      
      // Act
      const result = quantity1.add(quantity2);
      
      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.value.value).toBe(150);
      expect(result.value.unit).toBe(UnitOfMeasure.GRAM);
    });

    it('should reject adding quantities with different units', () => {
      // Arrange
      const quantity1 = Quantity.create(100, UnitOfMeasure.GRAM).value;
      const quantity2 = Quantity.create(5, UnitOfMeasure.PIECE).value;
      
      // Act
      const result = quantity1.add(quantity2);
      
      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.error).toContain('different units');
    });

    it('should subtract quantities with the same unit', () => {
      // Arrange
      const quantity1 = Quantity.create(100, UnitOfMeasure.GRAM).value;
      const quantity2 = Quantity.create(30, UnitOfMeasure.GRAM).value;
      
      // Act
      const result = quantity1.subtract(quantity2);
      
      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.value.value).toBe(70);
      expect(result.value.unit).toBe(UnitOfMeasure.GRAM);
    });

    it('should reject subtraction that would result in negative quantity', () => {
      // Arrange
      const quantity1 = Quantity.create(10, UnitOfMeasure.PIECE).value;
      const quantity2 = Quantity.create(20, UnitOfMeasure.PIECE).value;
      
      // Act
      const result = quantity1.subtract(quantity2);
      
      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.error).toContain('cannot be negative');
    });

    it('should multiply a quantity by a positive number', () => {
      // Arrange
      const quantity = Quantity.create(10, UnitOfMeasure.MILLILITER).value;
      
      // Act
      const result = quantity.multiply(5);
      
      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.value.value).toBe(50);
      expect(result.value.unit).toBe(UnitOfMeasure.MILLILITER);
    });

    it('should reject multiplication by a negative number', () => {
      // Arrange
      const quantity = Quantity.create(10, UnitOfMeasure.MILLILITER).value;
      
      // Act
      const result = quantity.multiply(-2);
      
      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.error).toContain('cannot be negative');
    });
  });

  describe('utility methods', () => {
    it('should correctly identify zero quantity', () => {
      // Arrange
      const zeroQuantity = Quantity.create(0, UnitOfMeasure.GRAM).value;
      const nonZeroQuantity = Quantity.create(10, UnitOfMeasure.GRAM).value;
      
      // Act & Assert
      expect(zeroQuantity.isZero()).toBe(true);
      expect(nonZeroQuantity.isZero()).toBe(false);
    });

    it('should correctly identify positive quantity', () => {
      // Arrange
      const zeroQuantity = Quantity.create(0, UnitOfMeasure.GRAM).value;
      const positiveQuantity = Quantity.create(10, UnitOfMeasure.GRAM).value;
      
      // Act & Assert
      expect(zeroQuantity.isPositive()).toBe(false);
      expect(positiveQuantity.isPositive()).toBe(true);
    });

    it('should generate correct string representation', () => {
      // Arrange
      const quantity = Quantity.create(10, UnitOfMeasure.KILOGRAM).value;
      
      // Act
      const stringRepresentation = quantity.toString();
      
      // Assert
      expect(stringRepresentation).toBe('10 KILOGRAM');
    });

    it('should correctly compare equal quantities', () => {
      // Arrange
      const quantity1 = Quantity.create(10, UnitOfMeasure.PIECE).value;
      const quantity2 = Quantity.create(10, UnitOfMeasure.PIECE).value;
      const quantity3 = Quantity.create(20, UnitOfMeasure.PIECE).value;
      const quantity4 = Quantity.create(10, UnitOfMeasure.GRAM).value;
      
      // Act & Assert
      expect(quantity1.equals(quantity2)).toBe(true);
      expect(quantity1.equals(quantity3)).toBe(false);
      expect(quantity1.equals(quantity4)).toBe(false);
    });
  });
});
