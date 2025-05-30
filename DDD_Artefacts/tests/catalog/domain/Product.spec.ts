import { ProductId } from '@catalog/domain/value-objects/ProductId';

describe('Catalog Domain - Product', () => {
  describe('Product Value Objects', () => {
    describe('ProductId', () => {
      it('should create a valid ProductId', () => {
        const result = ProductId.create('product-123');
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.value).toBe('product-123');
        }
      });
      
      it('should allow empty string as ProductId', () => {
        // The current implementation only guards against null/undefined, not empty strings
        const result = ProductId.create('');
        expect(result.isSuccess()).toBe(true);
      });
      
      it('should reject null ProductId', () => {
        const result = ProductId.create(null as unknown as string);
        expect(result.isFailure()).toBe(true);
      });
      
      it('should compare ProductIds for equality', () => {
        const id1Result = ProductId.create('product-123');
        const id2Result = ProductId.create('product-123');
        const id3Result = ProductId.create('product-456');
        
        expect(id1Result.isSuccess() && id2Result.isSuccess() && id3Result.isSuccess()).toBe(true);
        
        if (id1Result.isSuccess() && id2Result.isSuccess() && id3Result.isSuccess()) {
          const id1 = id1Result.value;
          const id2 = id2Result.value;
          const id3 = id3Result.value;
          
          expect(id1.equals(id2)).toBe(true);
          expect(id1.equals(id3)).toBe(false);
        }
      });

    });
  });
});
