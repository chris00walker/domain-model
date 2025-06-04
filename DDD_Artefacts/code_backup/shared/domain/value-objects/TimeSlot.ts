import { ValueObject } from '../base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';
import { Clock, SystemClock } from '@shared/domain/Clock';

interface TimeSlotProps {
  startTime: Date;
  endTime: Date;
}

/**
 * TimeSlot Value Object
 * 
 * Represents a time window for delivery or pickup operations.
 * 
 * Invariants:
 * - startTime must be before endTime
 * - startTime must not be in the past when created
 * - Duration between startTime and endTime must be reasonable (configured in business rules)
 */
export class TimeSlot extends ValueObject<TimeSlotProps> {
  private static readonly MIN_DURATION_MINUTES = 30;
  private static readonly MAX_DURATION_HOURS = 4;

  get startTime(): Date {
    return new Date(this.props.startTime);
  }

  get endTime(): Date {
    return new Date(this.props.endTime);
  }

  get durationMinutes(): number {
    return (this.props.endTime.getTime() - this.props.startTime.getTime()) / (1000 * 60);
  }

  private constructor(props: TimeSlotProps) {
    super(props);
  }

  public static create(startTime: Date, endTime: Date, validateStartTimeInFuture: boolean = true, clock: Clock = new SystemClock()): Result<TimeSlot, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: startTime, argumentName: 'startTime' },
      { argument: endTime, argumentName: 'endTime' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (startTime >= endTime) {
      return failure('Start time must be before end time');
    }

    // Skip the validation for past dates when explicitly requested
    if (validateStartTimeInFuture) {
      const now = clock.now();
      if (startTime < now) {
        return failure('Start time cannot be in the past');
      }
    }

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    if (durationMinutes < TimeSlot.MIN_DURATION_MINUTES) {
      return failure(`Time slot duration must be at least ${TimeSlot.MIN_DURATION_MINUTES} minutes`);
    }

    if (durationMinutes > TimeSlot.MAX_DURATION_HOURS * 60) {
      return failure(`Time slot duration must not exceed ${TimeSlot.MAX_DURATION_HOURS} hours`);
    }

    return success(new TimeSlot({ startTime, endTime }));
  }

  public isOverlapping(timeSlot: TimeSlot): boolean {
    return (
      (this.startTime <= timeSlot.startTime && this.endTime > timeSlot.startTime) ||
      (timeSlot.startTime <= this.startTime && timeSlot.endTime > this.startTime)
    );
  }

  public isActive(clock: Clock = new SystemClock()): boolean {
    const now = clock.now();
    return this.startTime <= now && this.endTime > now;
  }

  public isPending(clock: Clock = new SystemClock()): boolean {
    const now = clock.now();
    return this.startTime > now;
  }

  public isExpired(clock: Clock = new SystemClock()): boolean {
    const now = clock.now();
    return this.endTime <= now;
  }

  public toString(): string {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString();
    };
    
    // If same day, just show times
    if (this.startTime.toDateString() === this.endTime.toDateString()) {
      return `${formatDate(this.startTime)} ${formatTime(this.startTime)} - ${formatTime(this.endTime)}`;
    }
    
    // Different days
    return `${formatDate(this.startTime)} ${formatTime(this.startTime)} - ${formatDate(this.endTime)} ${formatTime(this.endTime)}`;
  }

  public equals(vo?: ValueObject<TimeSlotProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof TimeSlot)) {
      return false;
    }
    
    // Compare the underlying Date objects' timestamps
    return (
      this.props.startTime.getTime() === vo.props.startTime.getTime() &&
      this.props.endTime.getTime() === vo.props.endTime.getTime()
    );
  }
}
