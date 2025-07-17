import { ValueObject } from '../../../shared/domain/base/ValueObject';
import { Result, success, failure } from '../../../shared/core/Result';
import { Guard } from '../../../shared/core/Guard';

export enum SubscriptionStatusType {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

interface SubscriptionStatusProps {
  value: SubscriptionStatusType;
}

export class SubscriptionStatus extends ValueObject<SubscriptionStatusProps> {
  get value(): SubscriptionStatusType {
    return this.props.value;
  }

  private constructor(props: SubscriptionStatusProps) {
    super(props);
  }

  public static create(status: SubscriptionStatusType): Result<SubscriptionStatus, string> {
    const guardResult = Guard.againstNullOrUndefined(status, 'status');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    const validStatuses = Object.values(SubscriptionStatusType);
    if (!validStatuses.includes(status)) {
      return failure(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return success(new SubscriptionStatus({ value: status }));
  }

  public equals(vo?: ValueObject<SubscriptionStatusProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof SubscriptionStatus)) {
      return false;
    }
    return this.value === vo.value;
  }

  public isActive(): boolean {
    return this.props.value === SubscriptionStatusType.ACTIVE;
  }

  public isPaused(): boolean {
    return this.props.value === SubscriptionStatusType.PAUSED;
  }

  public isCancelled(): boolean {
    return this.props.value === SubscriptionStatusType.CANCELLED;
  }

  public isExpired(): boolean {
    return this.props.value === SubscriptionStatusType.EXPIRED;
  }
}
