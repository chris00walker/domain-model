import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Result, success, failure } from '../../../shared/domain/base/Result';
import { Guard } from '../../../shared/domain/base/Guard';

interface QuarantineStatusProps {
  isQuarantined: boolean;
  reason?: string;
  startDate: Date;
  endDate?: Date;
}

/**
 * QuarantineStatus value object represents the quarantine state of a product
 * during the quality verification process
 */
export class QuarantineStatus extends ValueObject<QuarantineStatusProps> {
  private constructor(props: QuarantineStatusProps) {
    super(props);
  }

  public static create(props: QuarantineStatusProps): Result<QuarantineStatus, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.isQuarantined, argumentName: 'isQuarantined' },
      { argument: props.startDate, argumentName: 'startDate' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // If product is quarantined, a reason must be provided
    if (props.isQuarantined && (!props.reason || props.reason.trim().length === 0)) {
      return failure('Quarantine reason must be provided when a product is quarantined');
    }

    // If an end date is provided, it must be after the start date
    if (props.endDate && props.endDate < props.startDate) {
      return failure('Quarantine end date must be after the start date');
    }

    return success(new QuarantineStatus({
      isQuarantined: props.isQuarantined,
      reason: props.isQuarantined ? props.reason!.trim() : undefined,
      startDate: props.startDate,
      endDate: props.endDate
    }));
  }

  get isQuarantined(): boolean {
    return this.props.isQuarantined;
  }

  get reason(): string | undefined {
    return this.props.reason;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  /**
   * Determines if the quarantine is currently active
   */
  public isActive(): boolean {
    if (!this.props.isQuarantined) {
      return false;
    }

    const now = new Date();
    return !this.props.endDate || this.props.endDate > now;
  }

  /**
   * Creates a new QuarantineStatus with the quarantine released
   */
  public release(): Result<QuarantineStatus, string> {
    if (!this.props.isQuarantined) {
      return failure('Cannot release a product that is not quarantined');
    }

    return QuarantineStatus.create({
      isQuarantined: false,
      startDate: this.props.startDate,
      endDate: new Date()
    });
  }

  /**
   * Creates a new QuarantineStatus with updated reason
   */
  public updateReason(newReason: string): Result<QuarantineStatus, string> {
    if (!this.props.isQuarantined) {
      return failure('Cannot update reason for a product that is not quarantined');
    }

    if (!newReason || newReason.trim().length === 0) {
      return failure('Quarantine reason cannot be empty');
    }

    return QuarantineStatus.create({
      isQuarantined: true,
      reason: newReason,
      startDate: this.props.startDate,
      endDate: this.props.endDate
    });
  }
}
