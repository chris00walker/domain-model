import { SubscriptionPlan } from '../domain/aggregates/SubscriptionPlan';
import { SubscriptionTier, SubscriptionTierType } from '../domain/value-objects/SubscriptionTier';
import { SubscriptionFrequency, FrequencyType } from '../domain/value-objects/SubscriptionFrequency';
import { SubscriptionBenefit, BenefitType } from '../domain/value-objects/SubscriptionBenefit';
import { Money } from '@shared/domain/value-objects/Money';
import { TestClock } from '@shared/domain/Clock';

describe('SubscriptionPlan Aggregate with Clock', () => {
  // Test constants
  const initialDate = new Date('2025-05-20T10:00:00Z');
  
  // Helper functions to create test data with proper Result handling
  const createTier = () => {
    const result = SubscriptionTier.create(SubscriptionTierType.BASIC);
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null as unknown as SubscriptionTier;
  };
  
  const createFrequency = () => {
    const result = SubscriptionFrequency.create(FrequencyType.WEEKLY);
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null as unknown as SubscriptionFrequency;
  };
  
  const createBenefit = () => {
    const result = SubscriptionBenefit.create({
      name: 'Test Benefit',
      description: 'A test benefit',
      type: BenefitType.DISCOUNT
    });
    expect(result.isSuccess()).toBeTruthy();
    return result.isSuccess() ? result.value : null as unknown as SubscriptionBenefit;
  };
  
  const createValidProps = () => {
    const tier = createTier();
    
    // Get basket credit amount from the tier
    const basketCreditAmount = tier.getBasketCredit();
    
    // Create the Money object with proper Result handling
    const priceResult = Money.create(50, 'BBD');
    expect(priceResult.isSuccess()).toBeTruthy();
    const price = priceResult.isSuccess() ? priceResult.value : null as unknown as Money;
    
    // Create basket credit Money with proper Result handling
    const basketCreditResult = Money.create(basketCreditAmount, 'BBD');
    expect(basketCreditResult.isSuccess()).toBeTruthy();
    const basketCredit = basketCreditResult.isSuccess() ? basketCreditResult.value : null as unknown as Money;
    
    return {
      name: 'Standard Plan',
      description: 'A standard subscription plan',
      frequency: createFrequency(),
      durationMonths: 6,
      price,
      discountPercentage: 10,
      isActive: true,
      productIds: ['123', '456'],
      availableFrom: new Date('2025-01-01'),
      maxSkipsAllowed: 2,
      maxSubstitutionsAllowed: 2,
      autoRenew: true,
      tier,
      benefits: [createBenefit()],
      basketCredit,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  it('should set createdAt and updatedAt using the provided clock on creation', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProps();
    
    // Act
    const planResult = SubscriptionPlan.create(props, undefined, testClock);
    
    // Assert
    expect(planResult.isSuccess()).toBeTruthy();
    if (!planResult.isSuccess()) return;
    const plan = planResult.value;
    
    // Check timestamps match the test clock
    expect(plan.createdAt.getTime()).toBe(initialDate.getTime());
    expect(plan.updatedAt.getTime()).toBe(initialDate.getTime());
  });
  
  it('should update timestamps when updating availability', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProps();
    const planResult = SubscriptionPlan.create(props, undefined, testClock);
    expect(planResult.isSuccess()).toBeTruthy();
    if (!planResult.isSuccess()) return;
    const plan = planResult.value;
    
    // Advance clock
    const updateTime = new Date('2025-05-25T14:30:00Z');
    testClock.setCurrentTime(updateTime);
    
    // New dates for availability
    const newAvailableFrom = new Date('2025-06-01');
    const newAvailableUntil = new Date('2025-12-31');
    
    // Act
    const result = plan.updateAvailability(true, newAvailableFrom, newAvailableUntil, testClock);
    
    // Assert
    expect(result.isSuccess()).toBeTruthy();
    expect(plan.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(plan.availableFrom.getTime()).toBe(newAvailableFrom.getTime());
    expect(plan.availableUntil?.getTime()).toBe(newAvailableUntil.getTime());
  });
  
  it('should update timestamps when updating pricing', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProps();
    const planResult = SubscriptionPlan.create(props, undefined, testClock);
    expect(planResult.isSuccess()).toBeTruthy();
    if (!planResult.isSuccess()) return;
    const plan = planResult.value;
    
    // Advance clock
    const updateTime = new Date('2025-05-28T09:15:00Z');
    testClock.setCurrentTime(updateTime);
    
    // New price values
    const newPriceResult = Money.create(75, 'BBD');
    expect(newPriceResult.isSuccess()).toBeTruthy();
    if (!newPriceResult.isSuccess()) return;
    const newPrice = newPriceResult.value;
    const newDiscount = 15;
    
    // Act
    const result = plan.updatePricing(newPrice, newDiscount, testClock);
    
    // Assert
    expect(result.isSuccess()).toBeTruthy();
    expect(plan.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(plan.price.equals(newPrice)).toBeTruthy();
    expect(plan.discountPercentage).toBe(newDiscount);
  });
  
  it('should update timestamps when updating tier', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProps();
    const planResult = SubscriptionPlan.create(props, undefined, testClock);
    expect(planResult.isSuccess()).toBeTruthy();
    if (!planResult.isSuccess()) return;
    const plan = planResult.value;
    
    // Advance clock
    const updateTime = new Date('2025-06-01T11:45:00Z');
    testClock.setCurrentTime(updateTime);
    
    // Create new tier with proper Result handling
    const newTierResult = SubscriptionTier.create(SubscriptionTierType.PREMIUM);
    expect(newTierResult.isSuccess()).toBeTruthy();
    if (!newTierResult.isSuccess()) return;
    const newTier = newTierResult.value;
    
    const newBasketCreditAmount = newTier.getBasketCredit();
    
    // Create new basket credit with proper Result handling
    const newBasketCreditResult = Money.create(newBasketCreditAmount, 'BBD');
    expect(newBasketCreditResult.isSuccess()).toBeTruthy();
    if (!newBasketCreditResult.isSuccess()) return;
    const newBasketCredit = newBasketCreditResult.value;
    
    // Act
    const result = plan.updateTier(newTier, newBasketCredit, undefined, testClock);
    
    // Assert
    expect(result.isSuccess()).toBeTruthy();
    expect(plan.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(plan.tier).toBe(newTier);
    expect(plan.basketCredit.equals(newBasketCredit)).toBeTruthy();
  });
  
  it('should update timestamps when adding a benefit', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProps();
    const planResult = SubscriptionPlan.create(props, undefined, testClock);
    expect(planResult.isSuccess()).toBeTruthy();
    if (!planResult.isSuccess()) return;
    const plan = planResult.value;
    
    // Record initial number of benefits
    const initialBenefitCount = plan.benefits.length;
    
    // Advance clock
    const updateTime = new Date('2025-06-05T16:20:00Z');
    testClock.setCurrentTime(updateTime);
    
    // New benefit with proper Result handling
    const newBenefitResult = SubscriptionBenefit.create({
      name: 'Free Shipping',
      description: 'Free shipping on all orders',
      type: BenefitType.FREE_SHIPPING
    });
    expect(newBenefitResult.isSuccess()).toBeTruthy();
    if (!newBenefitResult.isSuccess()) return;
    const newBenefit = newBenefitResult.value;
    
    // Act
    plan.addBenefit(newBenefit, testClock);
    
    // Assert
    expect(plan.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(plan.benefits.length).toBe(initialBenefitCount + 1);
    expect(plan.hasBenefitOfType(BenefitType.FREE_SHIPPING)).toBeTruthy();
  });
  
  it('should update timestamps when removing a benefit', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const props = createValidProps();
    const planResult = SubscriptionPlan.create(props, undefined, testClock);
    expect(planResult.isSuccess()).toBeTruthy();
    if (!planResult.isSuccess()) return;
    const plan = planResult.value;
    
    // Record initial number of benefits
    const initialBenefitCount = plan.benefits.length;
    expect(initialBenefitCount).toBeGreaterThan(0);
    const benefitToRemove = plan.benefits[0];
    
    // Advance clock
    const updateTime = new Date('2025-06-10T13:00:00Z');
    testClock.setCurrentTime(updateTime);
    
    // Act
    plan.removeBenefit(benefitToRemove.id, testClock);
    
    // Assert
    expect(plan.updatedAt.getTime()).toBe(updateTime.getTime());
    expect(plan.benefits.length).toBe(initialBenefitCount - 1);
  });
  
  it('should use clock for timestamps when creating a subscription plan for a specific tier', () => {
    // Arrange
    const testClock = new TestClock(initialDate);
    const tierType = SubscriptionTierType.VIP;
    const name = 'VIP Plan';
    const description = 'Premium VIP subscription plan';
    const frequency = createFrequency();
    
    // Act
    const result = SubscriptionPlan.createForTier(
      tierType,
      name,
      description,
      frequency,
      ['789', '012'],
      undefined,
      undefined,
      testClock
    );
    expect(result.isSuccess()).toBeTruthy();
    if (!result.isSuccess()) return;
    
    // Access the created plan
    const plan = result.value;
    
    expect(plan.createdAt.getTime()).toBe(initialDate.getTime());
    expect(plan.updatedAt.getTime()).toBe(initialDate.getTime());
    expect(plan.tier.type).toBe(tierType);
    expect(plan.tier.type).toBe(tierType);
    expect(plan.productIds.length).toBe(2);
    
    // VIP tier should have specific benefits
    expect(plan.hasBenefitOfType(BenefitType.FREE_SHIPPING)).toBeTruthy();
  });
});
