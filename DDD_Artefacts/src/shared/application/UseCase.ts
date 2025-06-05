/**
 * Generic UseCase interface
 * 
 * Defines the contract for application use cases following the command pattern.
 * Each use case takes a request object and returns a response.
 */
export interface UseCase<TRequest, TResponse> {
  /**
   * Executes the use case with the provided request data
   * @param request The input data required by the use case
   * @returns A promise resolving to the use case response
   */
  execute(request: TRequest): Promise<TResponse>;
}
