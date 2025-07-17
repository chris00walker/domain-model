import { 
  BaseApiController, 
  ApiRouter, 
  HttpMethod, 
  ApiRequest, 
  ApiResponse 
} from '../../../shared/infrastructure/api/ApiInfrastructure';
import { ILogger } from '../../../shared/infrastructure/logging/LoggingService';
import { IMonitoringService } from '../../../shared/infrastructure/monitoring/MonitoringService';
import { IAuthenticationService } from '../../../shared/infrastructure/auth/AuthenticationService';
import { ValidationService, ObjectValidator } from '../../../shared/infrastructure/validation/ValidationService';
import { SubscriptionService } from '../../domain/services/SubscriptionService';
import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { SubscriptionAggregate } from '../../domain/aggregates/SubscriptionAggregate';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { SubscriptionStatus } from '../../domain/value-objects/SubscriptionStatus';

/**
 * Subscription controller for exposing subscription domain services via API
 */
export class SubscriptionController extends BaseApiController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionRepository: ISubscriptionRepository,
    logger: ILogger,
    monitoringService: IMonitoringService,
    authService: IAuthenticationService,
    validationService: ValidationService
  ) {
    super(logger, monitoringService, authService, validationService);
  }
  
  /**
   * Get the base path for this controller
   */
  public getBasePath(): string {
    return '/api/subscriptions';
  }
  
  /**
   * Register routes for this controller
   * @param router The router to register routes with
   */
  public registerRoutes(router: ApiRouter): void {
    // Get subscription by ID
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/:id`,
      this.getSubscriptionById.bind(this),
      true,
      ['subscriptions:read']
    );
    
    // Get subscriptions by customer ID
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/customer/:customerId`,
      this.getSubscriptionsByCustomerId.bind(this),
      true,
      ['subscriptions:read']
    );
    
    // Create subscription
    router.registerRoute(
      HttpMethod.POST,
      this.getBasePath(),
      this.createSubscription.bind(this),
      true,
      ['subscriptions:create']
    );
    
    // Renew subscription
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/:id/renew`,
      this.renewSubscription.bind(this),
      true,
      ['subscriptions:update']
    );
    
    // Cancel subscription
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/:id/cancel`,
      this.cancelSubscription.bind(this),
      true,
      ['subscriptions:update']
    );
    
    // Pause subscription
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/:id/pause`,
      this.pauseSubscription.bind(this),
      true,
      ['subscriptions:update']
    );
    
    // Resume subscription
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/:id/resume`,
      this.resumeSubscription.bind(this),
      true,
      ['subscriptions:update']
    );
    
    // Change subscription plan
    router.registerRoute(
      HttpMethod.PUT,
      `${this.getBasePath()}/:id/plan`,
      this.changeSubscriptionPlan.bind(this),
      true,
      ['subscriptions:update']
    );
    
    // Set auto-renew
    router.registerRoute(
      HttpMethod.PUT,
      `${this.getBasePath()}/:id/auto-renew`,
      this.setAutoRenew.bind(this),
      true,
      ['subscriptions:update']
    );
    
    // Process due renewals (admin only)
    router.registerRoute(
      HttpMethod.POST,
      `${this.getBasePath()}/process-renewals`,
      this.processDueRenewals.bind(this),
      true,
      ['subscriptions:admin']
    );
    
    // Calculate customer lifetime value
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/customer/:customerId/lifetime-value`,
      this.calculateCustomerLifetimeValue.bind(this),
      true,
      ['subscriptions:read', 'analytics:read']
    );
    
    // Analyze churn risk
    router.registerRoute(
      HttpMethod.GET,
      `${this.getBasePath()}/customer/:customerId/churn-risk`,
      this.analyzeChurnRisk.bind(this),
      true,
      ['subscriptions:read', 'analytics:read']
    );
  }
  
  /**
   * Get subscription by ID
   * @param req The API request
   * @returns The subscription
   */
  private async getSubscriptionById(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      
      if (!id) {
        return failure('Subscription ID is required');
      }
      
      const subscriptionId = new UniqueEntityID(id);
      const subscriptionResult = await this.subscriptionRepository.findById(subscriptionId);
      
      if (subscriptionResult.isFailure()) {
        return failure(subscriptionResult.error);
      }
      
      const subscription = subscriptionResult.value;
      
      if (!subscription) {
        return failure('Subscription not found');
      }
      
      // Map domain model to API response
      return success(this.mapSubscriptionToResponse(subscription));
    } catch (error) {
      this.logger.error('Error getting subscription by ID', error);
      return failure(`Error getting subscription: ${error.message}`);
    }
  }
  
  /**
   * Get subscriptions by customer ID
   * @param req The API request
   * @returns The subscriptions
   */
  private async getSubscriptionsByCustomerId(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const customerId = req.params?.customerId;
      
      if (!customerId) {
        return failure('Customer ID is required');
      }
      
      const customerUniqueId = new UniqueEntityID(customerId);
      const subscriptionsResult = await this.subscriptionRepository.findByCustomerId(customerUniqueId);
      
      if (subscriptionsResult.isFailure()) {
        return failure(subscriptionsResult.error);
      }
      
      const subscriptions = subscriptionsResult.value;
      
      // Map domain models to API responses
      return success(subscriptions.map(subscription => this.mapSubscriptionToResponse(subscription)));
    } catch (error) {
      this.logger.error('Error getting subscriptions by customer ID', error);
      return failure(`Error getting subscriptions: ${error.message}`);
    }
  }
  
  /**
   * Create subscription
   * @param req The API request
   * @returns The created subscription
   */
  private async createSubscription(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const body = req.body;
      
      // Validate request
      const validator = this.createSubscriptionValidator();
      const validationResult = this.validationService.validate(validator, body);
      
      if (validationResult.isFailure()) {
        return validationResult;
      }
      
      // Create subscription
      const customerId = new UniqueEntityID(body.customerId);
      const planId = new UniqueEntityID(body.planId);
      
      const subscriptionResult = await this.subscriptionService.createSubscription(
        customerId,
        planId,
        body.billingAddress,
        body.shippingAddress,
        body.paymentMethodId,
        body.autoRenew
      );
      
      if (subscriptionResult.isFailure()) {
        return failure(subscriptionResult.error);
      }
      
      const subscription = subscriptionResult.value;
      
      // Map domain model to API response
      return success(this.mapSubscriptionToResponse(subscription));
    } catch (error) {
      this.logger.error('Error creating subscription', error);
      return failure(`Error creating subscription: ${error.message}`);
    }
  }
  
  /**
   * Renew subscription
   * @param req The API request
   * @returns The renewed subscription
   */
  private async renewSubscription(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      
      if (!id) {
        return failure('Subscription ID is required');
      }
      
      const subscriptionId = new UniqueEntityID(id);
      const renewalResult = await this.subscriptionService.renewSubscription(subscriptionId);
      
      if (renewalResult.isFailure()) {
        return failure(renewalResult.error);
      }
      
      const subscription = renewalResult.value;
      
      // Map domain model to API response
      return success(this.mapSubscriptionToResponse(subscription));
    } catch (error) {
      this.logger.error('Error renewing subscription', error);
      return failure(`Error renewing subscription: ${error.message}`);
    }
  }
  
  /**
   * Cancel subscription
   * @param req The API request
   * @returns Success or failure
   */
  private async cancelSubscription(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      const body = req.body || {};
      
      if (!id) {
        return failure('Subscription ID is required');
      }
      
      const subscriptionId = new UniqueEntityID(id);
      const cancelResult = await this.subscriptionService.cancelSubscription(
        subscriptionId,
        body.reason || 'Cancelled via API'
      );
      
      if (cancelResult.isFailure()) {
        return failure(cancelResult.error);
      }
      
      return success({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      this.logger.error('Error cancelling subscription', error);
      return failure(`Error cancelling subscription: ${error.message}`);
    }
  }
  
  /**
   * Pause subscription
   * @param req The API request
   * @returns Success or failure
   */
  private async pauseSubscription(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      const body = req.body || {};
      
      if (!id) {
        return failure('Subscription ID is required');
      }
      
      const subscriptionId = new UniqueEntityID(id);
      const pauseResult = await this.subscriptionService.pauseSubscription(
        subscriptionId,
        body.reason || 'Paused via API',
        body.resumeDate
      );
      
      if (pauseResult.isFailure()) {
        return failure(pauseResult.error);
      }
      
      return success({ message: 'Subscription paused successfully' });
    } catch (error) {
      this.logger.error('Error pausing subscription', error);
      return failure(`Error pausing subscription: ${error.message}`);
    }
  }
  
  /**
   * Resume subscription
   * @param req The API request
   * @returns Success or failure
   */
  private async resumeSubscription(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      
      if (!id) {
        return failure('Subscription ID is required');
      }
      
      const subscriptionId = new UniqueEntityID(id);
      const resumeResult = await this.subscriptionService.resumeSubscription(subscriptionId);
      
      if (resumeResult.isFailure()) {
        return failure(resumeResult.error);
      }
      
      return success({ message: 'Subscription resumed successfully' });
    } catch (error) {
      this.logger.error('Error resuming subscription', error);
      return failure(`Error resuming subscription: ${error.message}`);
    }
  }
  
  /**
   * Change subscription plan
   * @param req The API request
   * @returns Success or failure
   */
  private async changeSubscriptionPlan(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      const body = req.body;
      
      if (!id) {
        return failure('Subscription ID is required');
      }
      
      if (!body || !body.planId) {
        return failure('New plan ID is required');
      }
      
      const subscriptionId = new UniqueEntityID(id);
      const planId = new UniqueEntityID(body.planId);
      
      const changeResult = await this.subscriptionService.changeSubscriptionPlan(
        subscriptionId,
        planId,
        body.applyImmediately || false
      );
      
      if (changeResult.isFailure()) {
        return failure(changeResult.error);
      }
      
      return success({ message: 'Subscription plan changed successfully' });
    } catch (error) {
      this.logger.error('Error changing subscription plan', error);
      return failure(`Error changing subscription plan: ${error.message}`);
    }
  }
  
  /**
   * Set auto-renew
   * @param req The API request
   * @returns Success or failure
   */
  private async setAutoRenew(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const id = req.params?.id;
      const body = req.body;
      
      if (!id) {
        return failure('Subscription ID is required');
      }
      
      if (body.autoRenew === undefined) {
        return failure('Auto-renew flag is required');
      }
      
      const subscriptionId = new UniqueEntityID(id);
      
      const setAutoRenewResult = await this.subscriptionService.setAutoRenew(
        subscriptionId,
        body.autoRenew
      );
      
      if (setAutoRenewResult.isFailure()) {
        return failure(setAutoRenewResult.error);
      }
      
      return success({ 
        message: `Auto-renew ${body.autoRenew ? 'enabled' : 'disabled'} successfully` 
      });
    } catch (error) {
      this.logger.error('Error setting auto-renew', error);
      return failure(`Error setting auto-renew: ${error.message}`);
    }
  }
  
  /**
   * Process due renewals
   * @param req The API request
   * @returns Success or failure
   */
  private async processDueRenewals(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const body = req.body || {};
      const date = body.date ? new Date(body.date) : new Date();
      
      const processResult = await this.subscriptionService.processDueRenewals(date);
      
      if (processResult.isFailure()) {
        return failure(processResult.error);
      }
      
      return success({ 
        message: 'Due renewals processed successfully',
        renewedCount: processResult.value.length,
        renewedSubscriptions: processResult.value.map(s => s.id.toString())
      });
    } catch (error) {
      this.logger.error('Error processing due renewals', error);
      return failure(`Error processing due renewals: ${error.message}`);
    }
  }
  
  /**
   * Calculate customer lifetime value
   * @param req The API request
   * @returns The customer lifetime value
   */
  private async calculateCustomerLifetimeValue(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const customerId = req.params?.customerId;
      
      if (!customerId) {
        return failure('Customer ID is required');
      }
      
      const customerUniqueId = new UniqueEntityID(customerId);
      const lifetimeValueResult = await this.subscriptionService.calculateCustomerLifetimeValue(customerUniqueId);
      
      if (lifetimeValueResult.isFailure()) {
        return failure(lifetimeValueResult.error);
      }
      
      return success({
        customerId,
        lifetimeValue: lifetimeValueResult.value
      });
    } catch (error) {
      this.logger.error('Error calculating customer lifetime value', error);
      return failure(`Error calculating customer lifetime value: ${error.message}`);
    }
  }
  
  /**
   * Analyze churn risk
   * @param req The API request
   * @returns The churn risk analysis
   */
  private async analyzeChurnRisk(req: ApiRequest): Promise<Result<any, string>> {
    try {
      const customerId = req.params?.customerId;
      
      if (!customerId) {
        return failure('Customer ID is required');
      }
      
      const customerUniqueId = new UniqueEntityID(customerId);
      const churnRiskResult = await this.subscriptionService.analyzeChurnRisk(customerUniqueId);
      
      if (churnRiskResult.isFailure()) {
        return failure(churnRiskResult.error);
      }
      
      return success({
        customerId,
        churnRisk: churnRiskResult.value
      });
    } catch (error) {
      this.logger.error('Error analyzing churn risk', error);
      return failure(`Error analyzing churn risk: ${error.message}`);
    }
  }
  
  /**
   * Map subscription domain model to API response
   * @param subscription The subscription domain model
   * @returns The API response
   */
  private mapSubscriptionToResponse(subscription: SubscriptionAggregate): any {
    return {
      id: subscription.id.toString(),
      customerId: subscription.customerId.toString(),
      planId: subscription.planId.toString(),
      status: subscription.status.value,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate?.toISOString(),
      nextRenewalDate: subscription.nextRenewalDate.toISOString(),
      billingAddress: subscription.billingAddress,
      shippingAddress: subscription.shippingAddress,
      paymentMethodId: subscription.paymentMethodId,
      autoRenew: subscription.autoRenew,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelledAt: subscription.cancelledAt?.toISOString(),
      pausedAt: subscription.pausedAt?.toISOString(),
      resumeDate: subscription.resumeDate?.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString()
    };
  }
  
  /**
   * Create subscription validator
   * @returns The subscription validator
   */
  private createSubscriptionValidator(): ObjectValidator<any> {
    const validator = this.validationService.createValidator<any>();
    
    validator.forField('customerId').required();
    validator.forField('planId').required();
    validator.forField('billingAddress').required();
    validator.forField('shippingAddress').required();
    validator.forField('paymentMethodId').required();
    
    return validator;
  }
}
