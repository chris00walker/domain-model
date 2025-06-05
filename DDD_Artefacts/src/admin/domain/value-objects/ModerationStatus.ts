import { ValueObject } from '../../../shared/domain/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';

/**
 * Possible states of a moderation task
 */
export enum ModerationStatusValue {
  PENDING = 'PENDING',       // Awaiting review
  APPROVED = 'APPROVED',     // Content approved after review
  REJECTED = 'REJECTED',     // Content rejected after review
  FLAGGED = 'FLAGGED',       // Needs additional review
  AUTO_APPROVED = 'AUTO_APPROVED' // Automatically approved by system
}

interface ModerationStatusProps {
  value: ModerationStatusValue;
}

/**
 * ModerationStatus Value Object
 * 
 * Represents the current status of a content moderation task.
 */
export class ModerationStatus extends ValueObject<ModerationStatusProps> {
  
  get value(): ModerationStatusValue {
    return this.props.value;
  }
  
  private constructor(props: ModerationStatusProps) {
    super(props);
  }
  
  public static create(status: ModerationStatusValue): Result<ModerationStatus, Error> {
    if (!Object.values(ModerationStatusValue).includes(status)) {
      return failure(new Error('Invalid moderation status'));
    }
    
    return success(new ModerationStatus({ value: status }));
  }
  
  /**
   * Factory methods for creating specific status instances
   */
  public static PENDING(): ModerationStatus {
    return new ModerationStatus({ value: ModerationStatusValue.PENDING });
  }
  
  public static APPROVED(): ModerationStatus {
    return new ModerationStatus({ value: ModerationStatusValue.APPROVED });
  }
  
  public static REJECTED(): ModerationStatus {
    return new ModerationStatus({ value: ModerationStatusValue.REJECTED });
  }
  
  public static FLAGGED(): ModerationStatus {
    return new ModerationStatus({ value: ModerationStatusValue.FLAGGED });
  }
  
  public static AUTO_APPROVED(): ModerationStatus {
    return new ModerationStatus({ value: ModerationStatusValue.AUTO_APPROVED });
  }
  
  /**
   * Equality check with another ModerationStatus
   */
  public equals(vo?: ValueObject<ModerationStatusProps>): boolean {
    if (vo === undefined || vo === null) return false;
    
    if (!(vo instanceof ModerationStatus)) {
      return false;
    }
    
    return this.props.value === vo.props.value;
  }
  
  /**
   * Compare with a ModerationStatusValue enum value
   */
  public equalsValue(status: ModerationStatusValue): boolean {
    return this.props.value === status;
  }
  
  /**
   * Checks if the moderation task is completed (either approved or rejected)
   */
  public isCompleted(): boolean {
    return [
      ModerationStatusValue.APPROVED, 
      ModerationStatusValue.REJECTED,
      ModerationStatusValue.AUTO_APPROVED
    ].includes(this.props.value);
  }
  
  /**
   * Checks if the moderation task requires human review
   */
  public requiresHumanReview(): boolean {
    return [
      ModerationStatusValue.PENDING,
      ModerationStatusValue.FLAGGED
    ].includes(this.props.value);
  }
  
  toString(): string {
    return this.props.value;
  }
  
  valueOf(): ModerationStatusValue {
    return this.props.value;
  }
}
