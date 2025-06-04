import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

export enum FrequencyType {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY'
}

interface SubscriptionFrequencyProps {
  value: FrequencyType;
}

export class SubscriptionFrequency extends ValueObject<SubscriptionFrequencyProps> {
  get value(): FrequencyType {
    return this.props.value;
  }

  private constructor(props: SubscriptionFrequencyProps) {
    super(props);
  }

  public static create(frequency: FrequencyType): Result<SubscriptionFrequency, string> {
    const guardResult = Guard.againstNullOrUndefined(frequency, 'frequency');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    const validFrequencies = Object.values(FrequencyType);
    if (!validFrequencies.includes(frequency)) {
      return failure(`Frequency must be one of: ${validFrequencies.join(', ')}`);
    }

    return success(new SubscriptionFrequency({ value: frequency }));
  }

  public equals(vo?: ValueObject<SubscriptionFrequencyProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof SubscriptionFrequency)) {
      return false;
    }
    return this.value === vo.value;
  }
}
