import { Order } from '../aggregates/Order';
import { OrderRepository } from '../repositories/OrderRepository';
import { OrderItem } from '../value-objects/OrderItem';
import { OrderStatus } from '../value-objects/OrderStatus';
import { Result, success, failure } from '../../../shared/core/Result';
import { Money } from '../../../shared/domain/value-objects/Money';
import { CustomerId } from '../../../customer_management/domain/value-objects/CustomerId';

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Creates an order from a subscription
   * @param subscription The subscription to create an order from
   * @returns Result with the created order or an error message
   * 
   * NOTE: Commented out due to missing Subscription and SubscriptionItem types
   */
  /*
  async createFromSubscription(subscription: Subscription): Promise<Result<Order, string>> {
    try {
      // Create order items from subscription items
      const orderItemsPromises = subscription.items.map(async (subscriptionItem: SubscriptionItem) => {
        // productId is already a ProductId value object in the new model
        const productId = subscriptionItem.productId;
        
        return OrderItem.create({
          productId: productId,
          name: subscriptionItem.name,
          price: subscriptionItem.price,
          quantity: subscriptionItem.quantity,
          sku: subscriptionItem.sku,
          imageUrl: subscriptionItem.imageUrl
        });
      });

      // Wait for all order items to be created
      const orderItemsResults = await Promise.all(orderItemsPromises);

      // Check if any order items failed to create
      const failedItemResult = orderItemsResults.find((result: Result<OrderItem, string>) => result.isFailure());
      if (failedItemResult && failedItemResult.isFailure()) {
        return failure(failedItemResult.error);
      }

      // Extract the successful order items
      const orderItems = orderItemsResults
        .filter((result: Result<OrderItem, string>): result is Result<OrderItem, string> => result.isSuccess())
        .map((result: Result<OrderItem, string>) => result.isSuccess() ? result.value : null)
        .filter((item: OrderItem | null): item is OrderItem => item !== null);

      // Create the order
      // Convert the customerId string to a CustomerId value object
      const customerIdResult = CustomerId.create(subscription.customerId);
      if (customerIdResult.isFailure()) {
        return failure(`Invalid customer ID: ${customerIdResult.error}`);
      }

      const orderResult = Order.create({
        customerId: customerIdResult.value,
        items: orderItems,
        status: OrderStatus.Created,
        // Convert the address IDs to string addresses
        // In a real app, we would fetch the actual addresses using these IDs
        shippingAddress: subscription.shippingAddressId || 'Not provided',
        billingAddress: subscription.billingAddressId || 'Not provided',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (orderResult.isFailure()) {
        return failure(`Failed to create order: ${orderResult.error}`);
      }

      // Add subscription reference to the order
      // In a real implementation, we would store this as a property on the order
      // For now, we'll just save the order
      await this.orderRepository.save(orderResult.value);

      return success(orderResult.value);
    } catch (error) {
      return failure(`Error creating order from subscription: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets all orders generated from a specific subscription
   * @param subscriptionId The ID of the subscription
   * @returns Result with the list of orders or an error message
   */
  async getOrdersBySubscriptionId(subscriptionId: string): Promise<Result<Order[], string>> {
    try {
      // In a real implementation, we would query orders by subscription ID
      // For now, we'll return an empty array
      return success([]);
    } catch (error) {
      return failure(`Error retrieving orders for subscription: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a draft order template based on a subscription plan
   * This is used for showing customers what they'll receive before they subscribe
   * @param planId The ID of the subscription plan
   * @returns Result with the draft order or an error message
   */
  async createOrderTemplateFromPlan(planId: string): Promise<Result<Order, string>> {
    try {
      // In a real implementation, we would fetch the plan and create a template order
      // For now, we'll return a failure
      return failure('Not implemented');
    } catch (error) {
      return failure(`Error creating order template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
