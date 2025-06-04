export interface GuardResult {
  succeeded: boolean;
  message?: string;
}

export interface GuardArgument {
  argument: any;
  argumentName: string;
}

export type GuardArgumentCollection = GuardArgument[];

export class Guard {
  public static againstNullOrUndefined(argument: any, argumentName: string): GuardResult {
    if (argument === null || argument === undefined) {
      return { 
        succeeded: false, 
        message: `${argumentName} is null or undefined` 
      };
    }
    return { succeeded: true };
  }

  public static againstNullOrUndefinedBulk(args: GuardArgumentCollection): GuardResult {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (!result.succeeded) return result;
    }
    return { succeeded: true };
  }

  public static isOneOf(value: any, validValues: any[], argumentName: string): GuardResult {
    let isValid = false;
    for (const validValue of validValues) {
      if (value === validValue) {
        isValid = true;
        break;
      }
    }

    if (isValid) {
      return { succeeded: true };
    } else {
      return {
        succeeded: false,
        message: `${argumentName} isn't one of the correct types in ${JSON.stringify(validValues)}. Got "${value}"`
      };
    }
  }

  public static inRange(num: number, min: number, max: number, argumentName: string): GuardResult {
    const isInRange = num >= min && num <= max;
    if (!isInRange) {
      return { 
        succeeded: false, 
        message: `${argumentName} is not within range ${min} to ${max}.` 
      };
    }
    return { succeeded: true };
  }

  public static allInRange(numbers: number[], min: number, max: number, argumentName: string): GuardResult {
    for (const num of numbers) {
      const result = this.inRange(num, min, max, argumentName);
      if (!result.succeeded) return result;
    }
    return { succeeded: true };
  }
}
