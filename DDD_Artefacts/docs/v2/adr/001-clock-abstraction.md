---
title: Clock Abstraction for Temporal Logic
status: accepted
date: 2025-05-10
deciders: Core Architecture Team
---

# ADR-001: Clock Abstraction for Temporal Logic

## Status
Accepted

## Context
The domain model contains numerous time-dependent operations, including:
- Subscription renewal calculations
- Order deadline processing
- Time-limited promotions and discounts
- Authentication validity periods
- Inventory reservation expiration

In the initial implementation, these operations used direct system time calls (`new Date()`, `Date.now()`, etc.), which created several problems:
1. Non-deterministic behavior in tests
2. Inability to properly test time-dependent logic
3. Difficult to simulate time-based scenarios
4. Inability to freeze time for consistent test execution

These issues were specifically mentioned in the initial DDD audit as a critical area for improvement.

## Decision
We will implement a Clock abstraction with the following components:

1. A `Clock` interface:
   ```typescript
   interface Clock {
     now(): Date;
     today(): Date;
     tomorrow(): Date;
     yesterday(): Date;
     daysFromNow(days: number): Date;
   }
   ```

2. A production implementation (`SystemClock`):
   ```typescript
   class SystemClock implements Clock {
     now(): Date {
       return new Date();
     }
     
     // Other implementations using actual system time
   }
   ```

3. A test implementation (`TestClock`):
   ```typescript
   class TestClock implements Clock {
     private currentTime: Date;
     
     constructor(initialTime?: Date) {
       this.currentTime = initialTime || new Date();
     }
     
     now(): Date {
       return new Date(this.currentTime);
     }
     
     advanceBy(milliseconds: number): void {
       this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
     }
     
     advanceDays(days: number): void {
       this.advanceBy(days * 24 * 60 * 60 * 1000);
     }
     
     // Other implementations using the controlled time
   }
   ```

4. All domain services and entities requiring time operations will depend on this interface rather than directly accessing system time.

## Consequences

### Positive
- Tests are now deterministic and repeatable
- Time-dependent logic can be thoroughly tested by advancing time in controlled increments
- Complex temporal scenarios (like subscription renewals) can be simulated and verified
- All time operations are centralized behind a consistent interface
- Domain code is more explicit about its dependencies on time

### Negative
- Adds an additional abstraction layer that developers must understand
- Requires dependency injection infrastructure to provide the appropriate Clock implementation
- Slight performance overhead (minimal)
- Additional code to maintain

## Implementation Examples

### Domain Entity Using Clock
```typescript
class Subscription {
  private readonly clock: Clock;
  private readonly renewalDate: Date;
  
  constructor(clock: Clock, renewalDate: Date) {
    this.clock = clock;
    this.renewalDate = renewalDate;
  }
  
  isDueForRenewal(): boolean {
    const now = this.clock.now();
    return now >= this.renewalDate;
  }
  
  daysUntilRenewal(): number {
    const now = this.clock.now();
    const diffMs = this.renewalDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
```

### Test Using TestClock
```typescript
describe('Subscription renewal', () => {
  it('should identify when subscription is due for renewal', () => {
    // Arrange
    const testClock = new TestClock(new Date('2025-01-01T00:00:00Z'));
    const renewalDate = new Date('2025-01-10T00:00:00Z');
    const subscription = new Subscription(testClock, renewalDate);
    
    // Assert - not due yet
    expect(subscription.isDueForRenewal()).toBe(false);
    
    // Act - advance time to renewal date
    testClock.advanceDays(9);
    
    // Assert - not due yet (one day before)
    expect(subscription.isDueForRenewal()).toBe(false);
    
    // Act - advance time to renewal date
    testClock.advanceDays(1);
    
    // Assert - now due
    expect(subscription.isDueForRenewal()).toBe(true);
  });
});
```

## References
- [Object-Oriented Software Construction by Bertrand Meyer](https://www.amazon.com/Object-Oriented-Software-Construction-Book-CD-ROM/dp/0136291554)
- [Working Effectively with Legacy Code by Michael Feathers](https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052)
- [DDD Readiness Report](../implementation/README.md)
