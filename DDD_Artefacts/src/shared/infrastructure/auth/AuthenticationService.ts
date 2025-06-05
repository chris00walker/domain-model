import { Result, success, failure } from '../../core/Result';

/**
 * User role enum for role-based access control
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM'
}

/**
 * User context containing authentication and authorization information
 */
export interface UserContext {
  userId: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  tenantId?: string;
  metadata?: Record<string, any>;
  isAuthenticated: boolean;
  authTime: Date;
  expiresAt: Date;
}

/**
 * Authentication token interface
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  tokenType: string;
}

/**
 * Authentication service interface for cross-cutting authentication concerns
 */
export interface IAuthenticationService {
  /**
   * Authenticate a user with credentials
   * @param email User email
   * @param password User password
   * @returns Result with auth token if successful
   */
  authenticate(email: string, password: string): Promise<Result<AuthToken, string>>;
  
  /**
   * Validate an authentication token
   * @param token The token to validate
   * @returns Result with user context if token is valid
   */
  validateToken(token: string): Promise<Result<UserContext, string>>;
  
  /**
   * Refresh an authentication token
   * @param refreshToken The refresh token
   * @returns Result with new auth token if successful
   */
  refreshToken(refreshToken: string): Promise<Result<AuthToken, string>>;
  
  /**
   * Revoke an authentication token
   * @param token The token to revoke
   * @returns Result indicating success or failure
   */
  revokeToken(token: string): Promise<Result<void, string>>;
  
  /**
   * Check if a user has a specific permission
   * @param userContext The user context
   * @param permission The permission to check
   * @returns True if user has permission
   */
  hasPermission(userContext: UserContext, permission: string): boolean;
  
  /**
   * Check if a user has a specific role
   * @param userContext The user context
   * @param role The role to check
   * @returns True if user has role
   */
  hasRole(userContext: UserContext, role: UserRole): boolean;
}

/**
 * JWT-based authentication service implementation
 */
export class JwtAuthenticationService implements IAuthenticationService {
  constructor(
    private readonly jwtSecret: string,
    private readonly tokenExpiryMinutes: number = 60,
    private readonly refreshTokenExpiryDays: number = 7
  ) {}

  /**
   * Authenticate a user with credentials
   * @param email User email
   * @param password User password
   * @returns Result with auth token if successful
   */
  public async authenticate(email: string, password: string): Promise<Result<AuthToken, string>> {
    try {
      // In a real implementation, this would validate credentials against a database
      // and generate a JWT token with appropriate claims
      
      // For now, we'll return a mock implementation
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.tokenExpiryMinutes * 60 * 1000);
      
      const token: AuthToken = {
        accessToken: `mock-jwt-token-for-${email}`,
        refreshToken: `mock-refresh-token-for-${email}`,
        expiresAt: expiresAt,
        tokenType: 'Bearer'
      };
      
      return success(token);
    } catch (error) {
      return failure(`Authentication failed: ${error.message}`);
    }
  }
  
  /**
   * Validate an authentication token
   * @param token The token to validate
   * @returns Result with user context if token is valid
   */
  public async validateToken(token: string): Promise<Result<UserContext, string>> {
    try {
      // In a real implementation, this would verify the JWT signature
      // and decode the claims
      
      // For now, we'll return a mock implementation
      if (!token || !token.startsWith('mock-jwt-token-for-')) {
        return failure('Invalid token');
      }
      
      const email = token.replace('mock-jwt-token-for-', '');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.tokenExpiryMinutes * 60 * 1000);
      
      const userContext: UserContext = {
        userId: `user-id-for-${email}`,
        email: email,
        roles: [UserRole.CUSTOMER],
        permissions: ['read:profile', 'update:profile'],
        isAuthenticated: true,
        authTime: now,
        expiresAt: expiresAt,
        metadata: {
          lastLogin: now.toISOString()
        }
      };
      
      return success(userContext);
    } catch (error) {
      return failure(`Token validation failed: ${error.message}`);
    }
  }
  
  /**
   * Refresh an authentication token
   * @param refreshToken The refresh token
   * @returns Result with new auth token if successful
   */
  public async refreshToken(refreshToken: string): Promise<Result<AuthToken, string>> {
    try {
      // In a real implementation, this would validate the refresh token
      // and generate a new JWT token
      
      // For now, we'll return a mock implementation
      if (!refreshToken || !refreshToken.startsWith('mock-refresh-token-for-')) {
        return failure('Invalid refresh token');
      }
      
      const email = refreshToken.replace('mock-refresh-token-for-', '');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.tokenExpiryMinutes * 60 * 1000);
      
      const token: AuthToken = {
        accessToken: `mock-jwt-token-for-${email}`,
        refreshToken: `mock-refresh-token-for-${email}`,
        expiresAt: expiresAt,
        tokenType: 'Bearer'
      };
      
      return success(token);
    } catch (error) {
      return failure(`Token refresh failed: ${error.message}`);
    }
  }
  
  /**
   * Revoke an authentication token
   * @param token The token to revoke
   * @returns Result indicating success or failure
   */
  public async revokeToken(token: string): Promise<Result<void, string>> {
    try {
      // In a real implementation, this would add the token to a blacklist
      // or revoke it in the token store
      
      // For now, we'll return a mock implementation
      if (!token) {
        return failure('Token is required');
      }
      
      return success(undefined);
    } catch (error) {
      return failure(`Token revocation failed: ${error.message}`);
    }
  }
  
  /**
   * Check if a user has a specific permission
   * @param userContext The user context
   * @param permission The permission to check
   * @returns True if user has permission
   */
  public hasPermission(userContext: UserContext, permission: string): boolean {
    if (!userContext.isAuthenticated) {
      return false;
    }
    
    return userContext.permissions.includes(permission);
  }
  
  /**
   * Check if a user has a specific role
   * @param userContext The user context
   * @param role The role to check
   * @returns True if user has role
   */
  public hasRole(userContext: UserContext, role: UserRole): boolean {
    if (!userContext.isAuthenticated) {
      return false;
    }
    
    return userContext.roles.includes(role);
  }
}
