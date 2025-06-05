import { Result, success, failure } from '../../core/Result';
import { ILogger } from '../logging/LoggingService';
import { IMonitoringService } from '../monitoring/MonitoringService';
import { IAuthenticationService, UserContext } from '../auth/AuthenticationService';
import { ValidationService, ValidationError } from '../validation/ValidationService';

/**
 * API request interface
 */
export interface ApiRequest<T = any> {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  user?: UserContext;
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  statusCode: number;
  body: T;
  headers?: Record<string, string>;
}

/**
 * API error interface
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * API controller interface
 */
export interface ApiController {
  /**
   * Get the base path for this controller
   */
  getBasePath(): string;
  
  /**
   * Register routes for this controller
   * @param router The router to register routes with
   */
  registerRoutes(router: ApiRouter): void;
}

/**
 * API route handler function type
 */
export type ApiRouteHandler = (req: ApiRequest) => Promise<Result<any, ApiError | string | ValidationError[]>>;

/**
 * HTTP method enum
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

/**
 * API route interface
 */
export interface ApiRoute {
  method: HttpMethod;
  path: string;
  handler: ApiRouteHandler;
  requiresAuth: boolean;
  requiredPermissions?: string[];
}

/**
 * API router interface
 */
export interface ApiRouter {
  /**
   * Register a route
   * @param method The HTTP method
   * @param path The route path
   * @param handler The route handler
   * @param requiresAuth Whether the route requires authentication
   * @param requiredPermissions Optional required permissions
   */
  registerRoute(
    method: HttpMethod,
    path: string,
    handler: ApiRouteHandler,
    requiresAuth: boolean,
    requiredPermissions?: string[]
  ): void;
  
  /**
   * Get all registered routes
   */
  getRoutes(): ApiRoute[];
}

/**
 * Base API router implementation
 */
export class BaseApiRouter implements ApiRouter {
  private readonly routes: ApiRoute[] = [];
  
  /**
   * Register a route
   * @param method The HTTP method
   * @param path The route path
   * @param handler The route handler
   * @param requiresAuth Whether the route requires authentication
   * @param requiredPermissions Optional required permissions
   */
  public registerRoute(
    method: HttpMethod,
    path: string,
    handler: ApiRouteHandler,
    requiresAuth: boolean,
    requiredPermissions?: string[]
  ): void {
    this.routes.push({
      method,
      path,
      handler,
      requiresAuth,
      requiredPermissions
    });
  }
  
  /**
   * Get all registered routes
   */
  public getRoutes(): ApiRoute[] {
    return [...this.routes];
  }
}

/**
 * Base API controller implementation
 */
export abstract class BaseApiController implements ApiController {
  constructor(
    protected readonly logger: ILogger,
    protected readonly monitoringService: IMonitoringService,
    protected readonly authService: IAuthenticationService,
    protected readonly validationService: ValidationService
  ) {}
  
  /**
   * Get the base path for this controller
   */
  public abstract getBasePath(): string;
  
  /**
   * Register routes for this controller
   * @param router The router to register routes with
   */
  public abstract registerRoutes(router: ApiRouter): void;
  
  /**
   * Create a successful API response
   * @param data The response data
   * @param statusCode The status code (default: 200)
   * @returns API response
   */
  protected createSuccessResponse<T>(data: T, statusCode: number = 200): ApiResponse<T> {
    return {
      statusCode,
      body: data
    };
  }
  
  /**
   * Create an error API response
   * @param error The error
   * @param statusCode The status code (default: 400)
   * @returns API response
   */
  protected createErrorResponse(error: ApiError | string | ValidationError[], statusCode: number = 400): ApiResponse<ApiError> {
    let apiError: ApiError;
    
    if (typeof error === 'string') {
      apiError = {
        code: 'ERROR',
        message: error
      };
    } else if (Array.isArray(error)) {
      // Handle validation errors
      apiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error
      };
    } else {
      apiError = error;
    }
    
    return {
      statusCode,
      body: apiError
    };
  }
}

/**
 * API middleware interface
 */
export interface ApiMiddleware {
  /**
   * Process a request
   * @param req The request
   * @returns Result with the modified request or an error
   */
  process(req: ApiRequest): Promise<Result<ApiRequest, ApiError>>;
}

/**
 * Authentication middleware
 */
export class AuthenticationMiddleware implements ApiMiddleware {
  constructor(
    private readonly authService: IAuthenticationService,
    private readonly logger: ILogger
  ) {}
  
  /**
   * Process a request by authenticating the user
   * @param req The request
   * @returns Result with the authenticated request or an error
   */
  public async process(req: ApiRequest): Promise<Result<ApiRequest, ApiError>> {
    try {
      const authHeader = req.headers?.['authorization'];
      
      if (!authHeader) {
        return failure({
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const validateResult = await this.authService.validateToken(token);
      
      if (validateResult.isFailure()) {
        return failure({
          code: 'UNAUTHORIZED',
          message: validateResult.error
        });
      }
      
      const userContext = validateResult.value;
      
      // Add user context to request
      return success({
        ...req,
        user: userContext
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Authentication middleware error', error as Error);
      
      return failure({
        code: 'UNAUTHORIZED',
        message: 'Authentication failed'
      });
    }
  }
}

/**
 * Permission middleware
 */
export class PermissionMiddleware implements ApiMiddleware {
  constructor(
    private readonly requiredPermissions: string[],
    private readonly logger: ILogger
  ) {}
  
  /**
   * Process a request by checking permissions
   * @param req The request
   * @returns Result with the request or an error
   */
  public async process(req: ApiRequest): Promise<Result<ApiRequest, ApiError>> {
    try {
      const user = req.user;
      
      if (!user) {
        return failure({
          code: 'FORBIDDEN',
          message: 'User context not found'
        });
      }
      
      for (const permission of this.requiredPermissions) {
        if (!user.permissions.includes(permission)) {
          return failure({
            code: 'FORBIDDEN',
            message: `Missing required permission: ${permission}`
          });
        }
      }
      
      return success(req);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Permission middleware error', error as Error);
      
      return failure({
        code: 'FORBIDDEN',
        message: 'Permission check failed'
      });
    }
  }
}

/**
 * API server interface
 */
export interface ApiServer {
  /**
   * Start the server
   * @param port The port to listen on
   */
  start(port: number): Promise<Result<void, string>>;
  
  /**
   * Stop the server
   */
  stop(): Promise<Result<void, string>>;
  
  /**
   * Register a controller
   * @param controller The controller to register
   */
  registerController(controller: ApiController): void;
  
  /**
   * Get the router
   */
  getRouter(): ApiRouter;
}

/**
 * Express-like API server implementation
 */
export class ExpressLikeApiServer implements ApiServer {
  private readonly router: BaseApiRouter = new BaseApiRouter();
  private readonly controllers: ApiController[] = [];
  private server: any = null;
  
  constructor(
    private readonly logger: ILogger,
    private readonly monitoringService: IMonitoringService,
    private readonly authService: IAuthenticationService
  ) {}
  
  /**
   * Start the server
   * @param port The port to listen on
   */
  public async start(port: number): Promise<Result<void, string>> {
    try {
      this.logger.info(`Starting API server on port ${port}`);
      
      // Register all controller routes
      for (const controller of this.controllers) {
        controller.registerRoutes(this.router);
      }
      
      // In a real implementation, this would start an Express server
      // For now, we'll just log that we would start the server
      this.logger.info(`API server started on port ${port}`);
      
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to start API server: ${errorMessage}`, error as Error);
      return failure(`Failed to start API server: ${errorMessage}`);
    }
  }
  
  /**
   * Stop the server
   */
  public async stop(): Promise<Result<void, string>> {
    try {
      if (this.server) {
        // In a real implementation, this would stop the Express server
        this.server = null;
      }
      
      this.logger.info('API server stopped');
      
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to stop API server: ${errorMessage}`, error as Error);
      return failure(`Failed to stop API server: ${errorMessage}`);
    }
  }
  
  /**
   * Register a controller
   * @param controller The controller to register
   */
  public registerController(controller: ApiController): void {
    this.controllers.push(controller);
    this.logger.info(`Registered controller with base path: ${controller.getBasePath()}`);
  }
  
  /**
   * Get the router
   */
  public getRouter(): ApiRouter {
    return this.router;
  }
  
  /**
   * Handle a route
   * @param route The route
   * @param req The request
   * @returns API response
   */
  private async handleRoute(route: ApiRoute, req: ApiRequest): Promise<ApiResponse> {
    const startTime = Date.now();
    
    try {
      // Apply authentication middleware if required
      if (route.requiresAuth) {
        const authMiddleware = new AuthenticationMiddleware(this.authService, this.logger);
        const authResult = await authMiddleware.process(req);
        
        if (authResult.isFailure()) {
          return {
            statusCode: 401,
            body: authResult.error
          };
        }
        
        req = authResult.value;
        
        // Apply permission middleware if required
        if (route.requiredPermissions && route.requiredPermissions.length > 0) {
          const permissionMiddleware = new PermissionMiddleware(route.requiredPermissions, this.logger);
          const permissionResult = await permissionMiddleware.process(req);
          
          if (permissionResult.isFailure()) {
            return {
              statusCode: 403,
              body: permissionResult.error
            };
          }
          
          req = permissionResult.value;
        }
      }
      
      // Handle the route
      const result = await route.handler(req);
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.monitoringService.recordHistogram('api_request_duration_ms', duration, {
        method: route.method,
        path: route.path,
        status: result.isSuccess() ? 'success' : 'failure'
      });
      
      // Return response
      if (result.isSuccess()) {
        return {
          statusCode: 200,
          body: result.value
        };
      } else {
        let statusCode = 400;
        
        if (typeof result.error === 'object' && 'code' in result.error) {
          if (result.error.code === 'UNAUTHORIZED') {
            statusCode = 401;
          } else if (result.error.code === 'FORBIDDEN') {
            statusCode = 403;
          } else if (result.error.code === 'NOT_FOUND') {
            statusCode = 404;
          } else if (result.error.code === 'CONFLICT') {
            statusCode = 409;
          } else if (result.error.code === 'INTERNAL_ERROR') {
            statusCode = 500;
          }
        }
        
        return {
          statusCode,
          body: result.error
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Unhandled error in route handler: ${errorMessage}`, error as Error);
      
      // Record error metric
      this.monitoringService.incrementCounter('api_unhandled_error', 1, {
        method: route.method,
        path: route.path
      });
      
      return {
        statusCode: 500,
        body: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      };
    }
  }
}

/**
 * API documentation generator
 */
export class ApiDocumentationGenerator {
  constructor(private readonly router: ApiRouter) {}
  
  /**
   * Generate API documentation
   * @returns API documentation
   */
  public generateDocumentation(): any {
    const routes = this.router.getRoutes();
    const endpoints: any[] = [];
    
    for (const route of routes) {
      endpoints.push({
        method: route.method,
        path: route.path,
        requiresAuth: route.requiresAuth,
        requiredPermissions: route.requiredPermissions || []
      });
    }
    
    return {
      title: 'Elias Food Imports API',
      version: '1.0.0',
      endpoints
    };
  }
}
