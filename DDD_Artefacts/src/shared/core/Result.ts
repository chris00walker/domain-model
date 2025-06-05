export type Result<S, F = Error> = Success<S, F> | Failure<S, F>;

export class Success<S, F = Error> {
  constructor(public readonly value: S) {}

  isSuccess(): this is Success<S, F> {
    return true;
  }

  isFailure(): this is Failure<S, F> {
    return false;
  }

  getValue(): S {
    return this.value;
  }

  getErrorValue(): F {
    throw new Error('Cannot get error from a success result');
  }
}

export class Failure<S, F = Error> {
  constructor(public readonly error: F) {}

  isSuccess(): this is Success<S, F> {
    return false;
  }

  isFailure(): this is Failure<S, F> {
    return true;
  }

  getValue(): S {
    throw new Error('Cannot get value from a failure result');
  }

  getErrorValue(): F {
    return this.error;
  }
}

export const success = <S, F = Error>(value: S): Result<S, F> => {
  return new Success(value);
};

export const failure = <S, F = Error>(error: F): Result<S, F> => {
  return new Failure<S, F>(error);
};

export const combine = <T>(results: Result<T>[]): Result<T[]> => {
  const values: T[] = [];
  
  for (const result of results) {
    if (result.isFailure()) {
      return failure(result.error);
    }
    values.push((result as Success<T>).value);
  }
  
  return success(values);
};
