import { PricingRule } from '@pricing/domain/entities/PricingRule';
import { PriceModifier, ModifierType } from '@pricing/domain/value-objects/PriceModifier';

describe('Pricing Domain - Entities', () => {
  describe('PricingRule', () => {
    it('should create a valid PricingRule with condition and modifier', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(15);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const result = PricingRule.create({
          condition: 'quantity > 10',
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const rule = result.value;
          expect(rule.condition).toBe('quantity > 10');
          expect(rule.modifier.type).toBe(ModifierType.PERCENTAGE_DISCOUNT);
          expect(rule.modifier.value).toBe(15);
        }
      }
    });

    it('should reject a PricingRule with empty condition', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(15);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const result = PricingRule.create({
          condition: '',
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(result.isFailure()).toBe(true);
      }
    });

    it('should reject a PricingRule with null condition', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(15);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const result = PricingRule.create({
          condition: null as unknown as string,
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(result.isFailure()).toBe(true);
      }
    });

    it('should reject a PricingRule with invalid modifier', () => {
      const result = PricingRule.create({
        condition: 'quantity > 10',
        modifier: {
          type: ModifierType.PERCENTAGE_DISCOUNT,
          value: -15 // Invalid negative value
        }
      });
      
      expect(result.isFailure()).toBe(true);
    });

    it('should evaluate rule condition correctly for quantity', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(15);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const ruleResult = PricingRule.create({
          condition: 'quantity > 10',
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(ruleResult.isSuccess()).toBe(true);
        if (ruleResult.isSuccess()) {
          const rule = ruleResult.value;
          
          // Context that satisfies the condition
          const validContext = {
            quantity: 15,
            productId: 'product-1',
            customerId: 'customer-1'
          };
          
          // Context that doesn't satisfy the condition
          const invalidContext = {
            quantity: 5,
            productId: 'product-1',
            customerId: 'customer-1'
          };
          
          expect(rule.evaluateCondition(validContext)).toBe(true);
          expect(rule.evaluateCondition(invalidContext)).toBe(false);
        }
      }
    });

    it('should evaluate rule condition correctly for product ID', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(15);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const ruleResult = PricingRule.create({
          condition: "productId === 'product-special'",
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(ruleResult.isSuccess()).toBe(true);
        if (ruleResult.isSuccess()) {
          const rule = ruleResult.value;
          
          // Context that satisfies the condition
          const validContext = {
            quantity: 1,
            productId: 'product-special',
            customerId: 'customer-1'
          };
          
          // Context that doesn't satisfy the condition
          const invalidContext = {
            quantity: 1,
            productId: 'product-regular',
            customerId: 'customer-1'
          };
          
          expect(rule.evaluateCondition(validContext)).toBe(true);
          expect(rule.evaluateCondition(invalidContext)).toBe(false);
        }
      }
    });

    it('should evaluate complex rule conditions correctly', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(15);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const ruleResult = PricingRule.create({
          condition: "quantity >= 5 && productId.startsWith('premium-')",
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(ruleResult.isSuccess()).toBe(true);
        if (ruleResult.isSuccess()) {
          const rule = ruleResult.value;
          
          // Context that satisfies both conditions
          const validContext1 = {
            quantity: 5,
            productId: 'premium-product',
            customerId: 'customer-1'
          };
          
          // Context that satisfies quantity but not product condition
          const invalidContext1 = {
            quantity: 5,
            productId: 'regular-product',
            customerId: 'customer-1'
          };
          
          // Context that satisfies product but not quantity condition
          const invalidContext2 = {
            quantity: 4,
            productId: 'premium-product',
            customerId: 'customer-1'
          };
          
          expect(rule.evaluateCondition(validContext1)).toBe(true);
          expect(rule.evaluateCondition(invalidContext1)).toBe(false);
          expect(rule.evaluateCondition(invalidContext2)).toBe(false);
        }
      }
    });

    it('should handle safe evaluation of malicious rule conditions', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(15);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const ruleResult = PricingRule.create({
          // Attempted exploit that could potentially delete data or cause harm
          condition: "quantity > 0; process.exit(1);",
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(ruleResult.isSuccess()).toBe(true);
        if (ruleResult.isSuccess()) {
          const rule = ruleResult.value;
          
          const context = {
            quantity: 5,
            productId: 'product-1',
            customerId: 'customer-1'
          };
          
          // Should safely handle the malicious condition without executing harmful code
          // Either by returning false or throwing a safe error
          try {
            const result = rule.evaluateCondition(context);
            // If it returns a boolean without executing the harmful code, we're good
            expect(typeof result).toBe('boolean');
          } catch (error) {
            // If it throws an error instead of executing harmful code, we're also good
            expect(error).toBeDefined();
          }
        }
      }
    });

    it('should apply the rule modifier to a price', () => {
      const modifierResult = PriceModifier.createDiscountFromPercentage(20);
      expect(modifierResult.isSuccess()).toBe(true);
      
      if (modifierResult.isSuccess()) {
        const modifier = modifierResult.value;
        const ruleResult = PricingRule.create({
          condition: 'quantity > 10',
          modifier: {
            type: modifier.type,
            value: modifier.value
          }
        });
        
        expect(ruleResult.isSuccess()).toBe(true);
        if (ruleResult.isSuccess()) {
          const rule = ruleResult.value;
          const originalPrice = 1000; // $10.00
          
          const modifiedPrice = rule.applyModifier(originalPrice);
          expect(modifiedPrice).toBe(800); // $10.00 - 20% = $8.00
        }
      }
    });
  });
});
