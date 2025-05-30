// We use fast-check for property-based testing
// This will be available once packages are installed
import * as fc from 'fast-check';
import { Result } from '@shared/core/Result';
import { DateRange } from '../domain/value-objects/DateRange';

describe('DateRange Property Tests', () => {
  // Define a DateRange input type
  interface DateRangeInput {
    start: Date;
    end: Date;
  }

  // Define generators for valid date ranges
  const validDateRangeGen = fc.tuple(
    fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }), // start date
    fc.nat(365 * 5) // max days to add (5 years)
  ).map(([start, daysToAdd]: [Date, number]): DateRangeInput => {
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + daysToAdd);
    return { start, end };
  });

  // Arbitrary date generator
  const dateGen = fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) });

  describe('invariants', () => {
    it('should always satisfy start ≤ end', () => {
      fc.assert(
        fc.property(validDateRangeGen, ({ start, end }: DateRangeInput) => {
          const result = DateRange.create(start, end);
          
          if (result.isSuccess()) {
            const dateRange = result.value;
            expect(dateRange.start.getTime()).toBeLessThanOrEqual(dateRange.end.getTime());
            return true;
          }
          
          // If creation failed, it should be because start > end
          // We can only access error when isFailure() is true
          if (result.isFailure()) {
            return result.error === 'Start date must be before or equal to end date';
          }
          return false;
        })
      );
    });

    it('should reject when start > end', () => {
      fc.assert(
        fc.property(validDateRangeGen, ({ start, end }: DateRangeInput) => {
          // Only consider cases where we have different dates
          if (start.getTime() === end.getTime()) {
            return true; // Skip identical dates
          }
          
          // Ensure end is always before start for this test
          const earlierDate = new Date(Math.min(start.getTime(), end.getTime()));
          const laterDate = new Date(Math.max(start.getTime(), end.getTime()));
          
          // Try to create with wrong order (later date as start)
          const result = DateRange.create(laterDate, earlierDate);
          
          // This should always fail
          if (!result.isFailure()) {
            return false;
          }
          
          // And with the specific error message
          return result.error === 'Start date must be before or equal to end date';
        })
      );
    });
  });

  describe('contains', () => {
    it('should always return true for start and end dates', () => {
      fc.assert(
        fc.property(validDateRangeGen, ({ start, end }: DateRangeInput) => {
          const result = DateRange.create(start, end);
          
          if (result.isSuccess()) {
            const dateRange = result.value;
            return dateRange.contains(start) && dateRange.contains(end);
          }
          
          return true; // Skip if creation failed
        })
      );
    });

    it('should return true for any date between start and end', () => {
      fc.assert(
        fc.property(
          validDateRangeGen,
          fc.float({ min: 0, max: 1 }), // factor to determine a point between start and end
          ({ start, end }: DateRangeInput, factor: number) => {
            const result = DateRange.create(start, end);
            
            if (result.isSuccess()) {
              const dateRange = result.value;
              const duration = end.getTime() - start.getTime();
              const pointInTime = new Date(start.getTime() + duration * factor);
              
              return dateRange.contains(pointInTime);
            }
            
            return true; // Skip if creation failed
          }
        )
      );
    });

    it('should return false for dates before start or after end', () => {
      fc.assert(
        fc.property(
          validDateRangeGen,
          fc.integer({ min: 1, max: 1000 }), // days to shift
          ({ start, end }: DateRangeInput, daysToShift: number) => {
            const result = DateRange.create(start, end);
            
            if (result.isSuccess()) {
              const dateRange = result.value;
              
              // Create dates before start and after end
              const before = new Date(start.getTime());
              before.setDate(before.getDate() - daysToShift);
              
              const after = new Date(end.getTime());
              after.setDate(after.getDate() + daysToShift);
              
              return !dateRange.contains(before) && !dateRange.contains(after);
            }
            
            return true; // Skip if creation failed
          }
        )
      );
    });
  });

  describe('overlaps', () => {
    it('should be reflexive (a overlaps a)', () => {
      fc.assert(
        fc.property(validDateRangeGen, ({ start, end }: DateRangeInput) => {
          const result = DateRange.create(start, end);
          
          if (result.isSuccess()) {
            const dateRange = result.value;
            return dateRange.overlaps(dateRange);
          }
          
          return true; // Skip if creation failed
        })
      );
    });

    it('should be symmetric (a overlaps b => b overlaps a)', () => {
      fc.assert(
        fc.property(validDateRangeGen, validDateRangeGen, (range1: DateRangeInput, range2: DateRangeInput) => {
          const result1 = DateRange.create(range1.start, range1.end);
          const result2 = DateRange.create(range2.start, range2.end);
          
          if (result1.isSuccess() && result2.isSuccess()) {
            const dateRange1 = result1.value;
            const dateRange2 = result2.value;
            
            const oneWay = dateRange1.overlaps(dateRange2);
            const otherWay = dateRange2.overlaps(dateRange1);
            
            return oneWay === otherWay;
          }
          
          return true; // Skip if creation failed
        })
      );
    });

    it('should correctly identify overlapping ranges', () => {
      // Case 1: one range contains the other
      // Case 2: ranges overlap partially
      // Case 3: ranges share an endpoint
      // Case 4: ranges don't overlap
      fc.assert(
        fc.property(
          validDateRangeGen,
          fc.integer({ min: -365, max: 365 }), // overlap shift days
          fc.integer({ min: -365, max: 365 }), // overlap end shift days
          (range: DateRangeInput, shiftStart: number, shiftEnd: number) => {
            const result1 = DateRange.create(range.start, range.end);
            
            if (result1.isSuccess()) {
              const dateRange1 = result1.value;
              
              // Create different scenarios
              const newStart = new Date(range.start.getTime() + shiftStart * 24 * 60 * 60 * 1000);
              const newEnd = new Date(range.end.getTime() + shiftEnd * 24 * 60 * 60 * 1000);
              
              // Only create valid ranges where start <= end
              if (newStart <= newEnd) {
                const result2 = DateRange.create(newStart, newEnd);
                
                if (result2.isSuccess()) {
                  const dateRange2 = result2.value;
                  
                  // Calculate expected overlap manually
                  const expectedOverlap = 
                    (newStart <= range.end && newEnd >= range.start);
                  
                  return dateRange1.overlaps(dateRange2) === expectedOverlap;
                }
              }
            }
            
            return true; // Skip if creation failed
          }
        )
      );
    });
  });

  describe('duration', () => {
    it('should correctly calculate duration in ms', () => {
      fc.assert(
        fc.property(validDateRangeGen, ({ start, end }: DateRangeInput) => {
          const result = DateRange.create(start, end);
          
          if (result.isSuccess()) {
            const dateRange = result.value;
            const expectedDuration = end.getTime() - start.getTime();
            
            return dateRange.durationMs() === expectedDuration;
          }
          
          return true; // Skip if creation failed
        })
      );
    });

    it('should correctly calculate duration in days', () => {
      fc.assert(
        fc.property(validDateRangeGen, ({ start, end }: DateRangeInput) => {
          const result = DateRange.create(start, end);
          
          if (result.isSuccess()) {
            const dateRange = result.value;
            const expectedDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            
            return Math.abs(dateRange.durationDays() - expectedDuration) < 0.001; // Allow for floating point imprecision
          }
          
          return true; // Skip if creation failed
        })
      );
    });
  });

  describe('intersection', () => {
    it('should return the correct intersection when ranges overlap', () => {
      fc.assert(
        fc.property(
          validDateRangeGen,
          fc.integer({ min: -100, max: 100 }), // overlap shift days for start
          fc.integer({ min: -100, max: 100 }), // overlap shift days for end
          (range: DateRangeInput, shiftStart: number, shiftEnd: number) => {
            const result1 = DateRange.create(range.start, range.end);
            
            if (result1.isSuccess()) {
              const dateRange1 = result1.value;
              
              // Create a second range that potentially overlaps
              const newStart = new Date(range.start.getTime() + shiftStart * 24 * 60 * 60 * 1000);
              const newEnd = new Date(range.end.getTime() + shiftEnd * 24 * 60 * 60 * 1000);
              
              // Only create valid ranges where start <= end
              if (newStart <= newEnd) {
                const result2 = DateRange.create(newStart, newEnd);
                
                if (result2.isSuccess()) {
                  const dateRange2 = result2.value;
                  
                  // If ranges don't overlap, intersection should fail
                  if (!dateRange1.overlaps(dateRange2)) {
                    const intersectionResult = dateRange1.intersection(dateRange2);
                    return intersectionResult.isFailure();
                  }
                  
                  // If ranges overlap, calculate expected intersection
                  const intersectionResult = dateRange1.intersection(dateRange2);
                  
                  if (intersectionResult.isSuccess()) {
                    const intersection = intersectionResult.value;
                    
                    // Expected start is the later of the two starts
                    const expectedStart = new Date(Math.max(
                      dateRange1.start.getTime(),
                      dateRange2.start.getTime()
                    ));
                    
                    // Expected end is the earlier of the two ends
                    const expectedEnd = new Date(Math.min(
                      dateRange1.end.getTime(),
                      dateRange2.end.getTime()
                    ));
                    
                    return intersection.start.getTime() === expectedStart.getTime() &&
                           intersection.end.getTime() === expectedEnd.getTime();
                  }
                }
              }
            }
            
            return true; // Skip if creation failed
          }
        )
      );
    });
  });
});
