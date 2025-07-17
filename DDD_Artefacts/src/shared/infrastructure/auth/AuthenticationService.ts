// Commented out to maintain pure domain model approach without infrastructure dependencies
// This file contains authentication infrastructure code that violates the pure domain model principle

// Placeholder interface exports to maintain module structure
export interface IAuthenticationService {
  validateToken(token: string): Promise<any>;
}
export interface UserContext {
  permissions: string[];
}

// Placeholder export to maintain module structure
export const AuthenticationService = {};
