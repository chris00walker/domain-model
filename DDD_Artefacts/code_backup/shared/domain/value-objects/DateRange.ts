import { ValueObject } from '../base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { UniqueEntityID } from '../base/UniqueEntityID';
import { Clock, SystemClock } from '@shared/domain/Clock';

interface DateRangeProps {
  start: Date;
  end: Date;
}

export class DateRangeCreated extends DomainEvent {
  constructor(
    public readonly dateRange: DateRange,
    id?: UniqueEntityID,
    clock: Clock = new SystemClock()
  ) {
    super({
      aggregateId: id ? id.toString() : new UniqueEntityID().toString(),
      occurredOn: clock.now()
    });
  }

  toPrimitives(): any {
    return {
      dateRange: {
        start: this.dateRange.start.toISOString(),
        end: this.dateRange.end.toISOString()
      }
    };
  }

  static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): DateRangeCreated {
    const { start, end } = payload.dateRange;
    const dateRangeResult = DateRange.create(
      new Date(start),
      new Date(end)
    );
    
    if (dateRangeResult.isFailure()) {
      throw new Error(`Failed to create DateRange: ${dateRangeResult.error}`);
    }

    const event = new DateRangeCreated(dateRangeResult.value, new UniqueEntityID(aggregateId));
    return event;
  }
}

/**
 * DateRange Value Object
 * 
 * Represents a range between two dates.
 * 
 * Invariants:
 * - Start date must be before or equal to end date
 * - Neither start nor end can be null/undefined
 */
export class DateRange extends ValueObject<DateRangeProps> {
  get start(): Date {
    return this.props.start;
  }

  get end(): Date {
    return this.props.end;
  }

  private constructor(props: DateRangeProps) {
    super(props);
  }

  public static create(start: Date, end: Date, clock: Clock = new SystemClock()): Result<DateRange, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: start, argumentName: 'start' },
      { argument: end, argumentName: 'end' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (start > end) {
      return failure('Start date must be before or equal to end date');
    }

    const dateRange = new DateRange({ start, end });
    
    // Register domain event
    const dateRangeCreated = new DateRangeCreated(dateRange, undefined, clock);
    dateRange.addDomainEvent(dateRangeCreated);
    
    return success(dateRange);
  }

  /**
   * Checks if this date range contains the provided date
   */
  public contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  /**
   * Checks if this date range overlaps with another date range
   */
  public overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  /**
   * Returns the duration of the date range in milliseconds
   */
  public durationMs(): number {
    return this.end.getTime() - this.start.getTime();
  }

  /**
   * Returns the duration in days
   */
  public durationDays(): number {
    return this.durationMs() / (1000 * 60 * 60 * 24);
  }

  /**
   * Creates a new DateRange with the same duration but shifted by the specified days
   */
  public shift(days: number): Result<DateRange, string> {
    const msToShift = days * 24 * 60 * 60 * 1000;
    const newStart = new Date(this.start.getTime() + msToShift);
    const newEnd = new Date(this.end.getTime() + msToShift);
    
    return DateRange.create(newStart, newEnd);
  }

  /**
   * Creates a new DateRange that is the intersection of this and another date range
   */
  public intersection(other: DateRange): Result<DateRange, string> {
    if (!this.overlaps(other)) {
      return failure('Date ranges do not overlap');
    }

    const start = this.start > other.start ? this.start : other.start;
    const end = this.end < other.end ? this.end : other.end;
    
    return DateRange.create(start, end);
  }

  /**
   * String representation of the date range
   */
  public toString(): string {
    return `${this.start.toISOString()} - ${this.end.toISOString()}`;
  }

  /**
   * Value objects don't typically dispatch domain events directly.
   * This method is a placeholder for compatibility with the current implementation.
   */
  private addDomainEvent(domainEvent: DomainEvent): void {
    // In a typical DDD implementation, only Aggregates would dispatch domain events
    // This is included for illustration purposes
    console.log(`Domain event created: ${domainEvent.constructor.name}`);
  }
}
