import { CustomerCreated } from '../../domain/events/CustomerCreated';
import { CustomerUpdated } from '../../domain/events/CustomerUpdated';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';

/**
 * Event handler for customer-related domain events
 * 
 * This handler processes customer events and performs necessary side effects
 * across bounded contexts.
 */
export class CustomerEventHandler {
  constructor(
    private customerRepository: CustomerRepository,
    // Add any other repositories or services needed
  ) {}

  /**
   * Handle the CustomerCreated event
   * This could trigger operations like:
   * - Creating a user account in the auth system
   * - Initializing customer preferences
   * - Setting up marketing communications
   */
  async handleCustomerCreated(event: CustomerCreated): Promise<void> {
    console.log(`Customer created: ${event.toPrimitives().customerId}`);
    
    // Example: Notify other bounded contexts
    // await this.notificationService.sendWelcomeEmail(event.toPrimitives().customerEmail);
    
    // Example: Initialize customer in other bounded contexts
    // await this.orderingService.initializeCustomer(event.toPrimitives().customerId);
  }

  /**
   * Handle the CustomerUpdated event
   * This could trigger operations like:
   * - Updating customer information in other bounded contexts
   * - Syncing address updates with shipping providers
   * - Tracking customer profile completeness
   */
  async handleCustomerUpdated(event: CustomerUpdated): Promise<void> {
    const eventData = event.toPrimitives();
    console.log(`Customer updated: ${eventData.customerId}, fields: ${eventData.updatedFields.join(', ')}`);
    
    // Example: If address was updated, sync with shipping provider
    if (eventData.updatedFields.includes('defaultShippingAddress')) {
      // await this.shippingService.updateCustomerAddress(eventData.customerId, ...);
    }
    
    // Example: If contact info was updated, update communication preferences
    if (eventData.updatedFields.includes('contactInfo')) {
      // await this.communicationService.updateContactInfo(eventData.customerId, ...);
    }
  }
}
