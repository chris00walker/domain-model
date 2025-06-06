# Domain Event Catalog

## Purpose

This catalog documents all significant domain events in the Elias Food Imports system. Domain events represent important state changes and business transactions that occur within the domain model. This catalog serves as a reference for developers, domain experts, and other stakeholders to understand how information flows through the system.

## Event Structure

Each domain event is documented with the following information:

- **Event Name:** The name of the event following the naming conventions in the Domain Event Naming Analysis
- **Definition:** A clear description of what the event represents and when it is fired
- **Payload:** The data included in the event
- **Producer Context:** The bounded context and specific component that produces the event
- **Consumer Context(s):** The bounded contexts and components that consume the event
- **Delivery Guarantee:** The reliability level of event delivery and the mechanism used

## Order Context Events

### OrderPlaced

- **Definition:** Fired when an `OrderAggregate` completes `placeOrder()`. Represents a new order being created in the system.
- **Payload:** `{orderId, customerId, items[], totalAmount, orderDate, shippingAddress, billingAddress}`
- **Producer Context:** `order/application/OrderService`
- **Consumer Context(s):** 
  - `inventory/application/InventoryService` (to reserve inventory)
  - `shipping/application/ShipmentService` (to prepare for fulfillment)
  - `payment/application/PaymentService` (to process payment)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for order confirmation emails)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### OrderFulfilled

- **Definition:** Fired when all items in an order have been picked, packed, and are ready for shipping.
- **Payload:** `{orderId, fulfillmentId, warehouseId, fulfilledItems[], fulfillmentDate}`
- **Producer Context:** `order/application/FulfillmentService`
- **Consumer Context(s):** 
  - `shipping/application/ShipmentService` (to initiate shipping)
  - `customer/application/CustomerService` (to update order history)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for fulfillment notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### OrderShipped

- **Definition:** Fired when an order has been handed off to a shipping carrier.
- **Payload:** `{orderId, shipmentId, carrier, trackingNumber, estimatedDeliveryDate, shippedItems[]}`
- **Producer Context:** `shipping/application/ShipmentService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update order history)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for shipping notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### OrderDelivered

- **Definition:** Fired when an order has been confirmed as delivered to the customer.
- **Payload:** `{orderId, shipmentId, deliveryDate, deliveryConfirmation}`
- **Producer Context:** `shipping/application/ShipmentService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update order history)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for delivery notification)
  - `review/application/ReviewService` (to prompt for product review)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### OrderCancelled

- **Definition:** Fired when an order is cancelled before fulfillment.
- **Payload:** `{orderId, cancellationReason, cancellationDate, refundRequired}`
- **Producer Context:** `order/application/OrderService`
- **Consumer Context(s):** 
  - `inventory/application/InventoryService` (to release reserved inventory)
  - `payment/application/PaymentService` (to process refund if needed)
  - `customer/application/CustomerService` (to update order history)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for cancellation notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### LineItemAddedToOrder

- **Definition:** Fired when a line item is added to an existing order.
- **Payload:** `{orderId, lineItemId, productId, quantity, unitPrice, totalPrice}`
- **Producer Context:** `order/application/OrderService`
- **Consumer Context(s):** 
  - `inventory/application/InventoryService` (to reserve additional inventory)
  - `pricing/application/PricingService` (to recalculate order totals)
  - `analytics/application/AnalyticsService` (for reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### LineItemRemovedFromOrder

- **Definition:** Fired when a line item is removed from an existing order.
- **Payload:** `{orderId, lineItemId, productId, quantity, refundAmount}`
- **Producer Context:** `order/application/OrderService`
- **Consumer Context(s):** 
  - `inventory/application/InventoryService` (to release reserved inventory)
  - `pricing/application/PricingService` (to recalculate order totals)
  - `payment/application/PaymentService` (to process partial refund if needed)
  - `analytics/application/AnalyticsService` (for reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### OrderReturned

- **Definition:** Fired when a customer initiates a return for an order or specific items.
- **Payload:** `{orderId, returnId, returnedItems[], returnReason, returnDate, refundAmount}`
- **Producer Context:** `order/application/ReturnService`
- **Consumer Context(s):** 
  - `inventory/application/InventoryService` (to process returned inventory)
  - `payment/application/PaymentService` (to process refund)
  - `customer/application/CustomerService` (to update order history)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for return confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### OrderPaymentConfirmed

- **Definition:** Fired when payment for an order has been successfully processed and confirmed.
- **Payload:** `{orderId, paymentId, amount, paymentMethod, transactionDate, transactionReference}`
- **Producer Context:** `payment/application/PaymentService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `fulfillment/application/FulfillmentService` (to begin fulfillment process)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for payment confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Payment Context Events

### PaymentCaptured

- **Definition:** Fired when a payment has been successfully captured from the customer's payment method.
- **Payload:** `{paymentId, orderId, amount, paymentMethod, transactionId, captureDate, status}`
- **Producer Context:** `payment/application/PaymentService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order payment status)
  - `analytics/application/AnalyticsService` (for financial reporting)
  - `notification/application/NotificationService` (for payment receipt)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### PaymentFailed

- **Definition:** Fired when a payment attempt fails for any reason.
- **Payload:** `{paymentId, orderId, amount, paymentMethod, failureReason, failureCode, attemptDate}`
- **Producer Context:** `payment/application/PaymentService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update payment method status if needed)
  - `analytics/application/AnalyticsService` (for reporting)
  - `notification/application/NotificationService` (for payment failure notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### RefundInitiated

- **Definition:** Fired when a refund process has been started for an order or line item.
- **Payload:** `{refundId, orderId, paymentId, amount, reason, initiatedDate, status}`
- **Producer Context:** `payment/application/RefundService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update customer history)
  - `analytics/application/AnalyticsService` (for financial reporting)
  - `notification/application/NotificationService` (for refund initiation notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### RefundCompleted

- **Definition:** Fired when a refund has been successfully processed and funds returned to the customer.
- **Payload:** `{refundId, orderId, paymentId, amount, completionDate, transactionId}`
- **Producer Context:** `payment/application/RefundService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update customer history)
  - `analytics/application/AnalyticsService` (for financial reporting)
  - `notification/application/NotificationService` (for refund completion notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ChargebackReceived

- **Definition:** Fired when a chargeback notification is received from a payment processor.
- **Payload:** `{chargebackId, orderId, paymentId, amount, reason, receivedDate, disputeDeadline}`
- **Producer Context:** `payment/application/ChargebackService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `fraud/application/FraudService` (to evaluate for potential fraud)
  - `analytics/application/AnalyticsService` (for financial reporting)
  - `notification/application/NotificationService` (for internal alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Inventory Context Events

### InventoryReserved

- **Definition:** Fired when inventory is reserved for a specific order to prevent overselling.
- **Payload:** `{reservationId, orderId, productId, quantity, warehouseId, expirationDate}`
- **Producer Context:** `inventory/application/InventoryService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to confirm inventory availability)
  - `catalog/application/ProductService` (to update available quantity)
  - `analytics/application/AnalyticsService` (for inventory reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### InventoryReleased

- **Definition:** Fired when previously reserved inventory is released back to available stock.
- **Payload:** `{reservationId, orderId, productId, quantity, warehouseId, releaseReason}`
- **Producer Context:** `inventory/application/InventoryService`
- **Consumer Context(s):** 
  - `catalog/application/ProductService` (to update available quantity)
  - `analytics/application/AnalyticsService` (for inventory reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### InventoryAllocated

- **Definition:** Fired when inventory is permanently allocated to an order during fulfillment.
- **Payload:** `{allocationId, orderId, productId, quantity, warehouseId, allocationDate}`
- **Producer Context:** `inventory/application/InventoryService`
- **Consumer Context(s):** 
  - `order/application/FulfillmentService` (to proceed with fulfillment)
  - `catalog/application/ProductService` (to update inventory counts)
  - `analytics/application/AnalyticsService` (for inventory reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ProductInventoryLevelChanged

- **Definition:** Fired when a product's inventory level changes due to receiving new stock, adjustments, or other non-order related events.
- **Payload:** `{productId, warehouseId, previousQuantity, newQuantity, changeReason, changeDate}`
- **Producer Context:** `inventory/application/InventoryService`
- **Consumer Context(s):** 
  - `catalog/application/ProductService` (to update product availability)
  - `analytics/application/AnalyticsService` (for inventory reporting)
  - `notification/application/NotificationService` (for low stock alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### LowStockThresholdReached

- **Definition:** Fired when a product's inventory falls below the configured reorder threshold.
- **Payload:** `{productId, warehouseId, currentQuantity, threshold, reorderSuggestion}`
- **Producer Context:** `inventory/application/InventoryService`
- **Consumer Context(s):** 
  - `purchasing/application/PurchasingService` (to trigger reordering)
  - `notification/application/NotificationService` (for low stock alerts)
  - `analytics/application/AnalyticsService` (for inventory reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### InventoryReceived

- **Definition:** Fired when new inventory is received and added to stock.
- **Payload:** `{receiptId, purchaseOrderId, productId, quantity, warehouseId, receivedDate, qualityStatus}`
- **Producer Context:** `inventory/application/ReceivingService`
- **Consumer Context(s):** 
  - `inventory/application/InventoryService` (to update inventory levels)
  - `purchasing/application/PurchasingService` (to close purchase orders)
  - `accounting/application/AccountingService` (for inventory valuation)
  - `analytics/application/AnalyticsService` (for inventory reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Catalog Context Events

### ProductCreated

- **Definition:** Fired when a new product is added to the catalog.
- **Payload:** `{productId, sku, name, description, categoryIds[], attributes{}, creationDate, status}`
- **Producer Context:** `catalog/application/ProductService`
- **Consumer Context(s):** 
  - `search/application/SearchService` (to index the product)
  - `inventory/application/InventoryService` (to initialize inventory records)
  - `analytics/application/AnalyticsService` (for catalog reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ProductUpdated

- **Definition:** Fired when product information is modified.
- **Payload:** `{productId, sku, updatedFields{}, previousValues{}, updateDate}`
- **Producer Context:** `catalog/application/ProductService`
- **Consumer Context(s):** 
  - `search/application/SearchService` (to update search index)
  - `analytics/application/AnalyticsService` (for catalog reporting)
  - `notification/application/NotificationService` (for product update alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ProductPriceChanged

- **Definition:** Fired when a product's price is updated.
- **Payload:** `{productId, sku, previousPrice, newPrice, currencyCode, effectiveDate, priceChangeReason}`
- **Producer Context:** `pricing/application/PricingService`
- **Consumer Context(s):** 
  - `catalog/application/ProductService` (to update product information)
  - `search/application/SearchService` (to update search index)
  - `analytics/application/AnalyticsService` (for pricing analytics)
  - `notification/application/NotificationService` (for price change alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ProductCategorized

- **Definition:** Fired when a product is assigned to a category or its categorization changes.
- **Payload:** `{productId, addedCategoryIds[], removedCategoryIds[], updateDate}`
- **Producer Context:** `catalog/application/CategoryService`
- **Consumer Context(s):** 
  - `search/application/SearchService` (to update search facets)
  - `analytics/application/AnalyticsService` (for catalog structure reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ProductAuthenticationStatusChanged

- **Definition:** Fired when a product's authentication status changes after verification.
- **Payload:** `{productId, sku, previousStatus, newStatus, verificationMethod, verificationDate, verificationDetails}`
- **Producer Context:** `catalogAuthentication/application/AuthenticationService`
- **Consumer Context(s):** 
  - `catalog/application/ProductService` (to update product status)
  - `inventory/application/InventoryService` (to update inventory status)
  - `analytics/application/AnalyticsService` (for authentication reporting)
  - `notification/application/NotificationService` (for authentication alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ProductDiscontinued

- **Definition:** Fired when a product is marked as discontinued.
- **Payload:** `{productId, sku, discontinuationDate, reason, replacementProductId}`
- **Producer Context:** `catalog/application/ProductLifecycleService`
- **Consumer Context(s):** 
  - `search/application/SearchService` (to update search index)
  - `inventory/application/InventoryService` (to update inventory status)
  - `analytics/application/AnalyticsService` (for product lifecycle reporting)
  - `notification/application/NotificationService` (for discontinuation notifications)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Customer Context Events

### CustomerRegistered

- **Definition:** Fired when a new customer completes the registration process.
- **Payload:** `{customerId, email, registrationDate, customerType, acquisitionSource}`
- **Producer Context:** `customer/application/CustomerService`
- **Consumer Context(s):** 
  - `marketing/application/MarketingService` (for welcome campaigns)
  - `analytics/application/AnalyticsService` (for customer acquisition reporting)
  - `notification/application/NotificationService` (for welcome emails)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### CustomerProfileUpdated

- **Definition:** Fired when a customer updates their profile information.
- **Payload:** `{customerId, updatedFields{}, previousValues{}, updateDate}`
- **Producer Context:** `customer/application/CustomerService`
- **Consumer Context(s):** 
  - `marketing/application/MarketingService` (for segmentation updates)
  - `analytics/application/AnalyticsService` (for customer data reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### CustomerSegmentAssigned

- **Definition:** Fired when a customer is assigned to a specific customer segment.
- **Payload:** `{customerId, segmentId, segmentName, assignmentDate, assignmentReason}`
- **Producer Context:** `customer/application/SegmentationService`
- **Consumer Context(s):** 
  - `marketing/application/MarketingService` (for targeted campaigns)
  - `pricing/application/PricingService` (for segment-specific pricing)
  - `analytics/application/AnalyticsService` (for segmentation reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### CustomerPreferencesChanged

- **Definition:** Fired when a customer updates their preferences (communication, product, etc.).
- **Payload:** `{customerId, preferenceCategory, updatedPreferences{}, previousPreferences{}, updateDate}`
- **Producer Context:** `customer/application/PreferenceService`
- **Consumer Context(s):** 
  - `marketing/application/MarketingService` (for preference-based targeting)
  - `notification/application/NotificationService` (for communication preferences)
  - `analytics/application/AnalyticsService` (for preference tracking)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### CustomerAccountDeactivated

- **Definition:** Fired when a customer account is deactivated (by customer or admin).
- **Payload:** `{customerId, deactivationDate, reason, deactivatedBy, reactivationEligibilityDate}`
- **Producer Context:** `customer/application/CustomerService`
- **Consumer Context(s):** 
  - `marketing/application/MarketingService` (to stop marketing communications)
  - `subscription/application/SubscriptionService` (to handle active subscriptions)
  - `analytics/application/AnalyticsService` (for churn reporting)
  - `notification/application/NotificationService` (for deactivation confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### LoyaltyPointsEarned

- **Definition:** Fired when a customer earns loyalty points from a qualifying action.
- **Payload:** `{customerId, pointsEarned, totalPointsBalance, source, transactionId, earnedDate, expirationDate}`
- **Producer Context:** `customer/application/LoyaltyService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (for points earned notification)
  - `analytics/application/AnalyticsService` (for loyalty program reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### LoyaltyPointsRedeemed

- **Definition:** Fired when a customer redeems loyalty points for a reward.
- **Payload:** `{customerId, pointsRedeemed, remainingPointsBalance, rewardId, redemptionDate}`
- **Producer Context:** `customer/application/LoyaltyService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (if redeemed for order discount)
  - `notification/application/NotificationService` (for redemption confirmation)
  - `analytics/application/AnalyticsService` (for loyalty program reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Shipping Context Events

### ShipmentScheduled

- **Definition:** Fired when a shipment is scheduled for pickup by a carrier.
- **Payload:** `{shipmentId, orderId, scheduledDate, carrier, serviceLevel, estimatedDeliveryDate}`
- **Producer Context:** `shipping/application/ShipmentService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update order history)
  - `notification/application/NotificationService` (for shipment scheduling notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ShipmentLabelGenerated

- **Definition:** Fired when a shipping label is generated for a shipment.
- **Payload:** `{shipmentId, orderId, labelId, carrier, trackingNumber, labelUrl, generationDate}`
- **Producer Context:** `shipping/application/LabelService`
- **Consumer Context(s):** 
  - `shipping/application/ShipmentService` (to update shipment status)
  - `order/application/OrderService` (to update order status)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ShipmentPickedUp

- **Definition:** Fired when a shipment is picked up by the carrier.
- **Payload:** `{shipmentId, orderId, carrier, trackingNumber, pickupDate, estimatedDeliveryDate}`
- **Producer Context:** `shipping/application/ShipmentService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update order history)
  - `notification/application/NotificationService` (for shipment pickup notification)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ShipmentInTransit

- **Definition:** Fired when a shipment status is updated to in-transit.
- **Payload:** `{shipmentId, orderId, carrier, trackingNumber, lastLocation, timestamp, updatedEstimatedDeliveryDate}`
- **Producer Context:** `shipping/application/TrackingService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update order history)
  - `notification/application/NotificationService` (for shipment status updates)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ShipmentDeliveryException

- **Definition:** Fired when a delivery exception occurs (delay, address issue, etc.).
- **Payload:** `{shipmentId, orderId, carrier, trackingNumber, exceptionType, exceptionDescription, timestamp, resolutionStatus}`
- **Producer Context:** `shipping/application/TrackingService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update order history)
  - `notification/application/NotificationService` (for exception alerts)
  - `customer-service/application/SupportService` (to create support case)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ShipmentDelivered

- **Definition:** Fired when a shipment is confirmed as delivered.
- **Payload:** `{shipmentId, orderId, carrier, trackingNumber, deliveryDate, recipientName, deliveryLocation, proofOfDelivery}`
- **Producer Context:** `shipping/application/TrackingService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to update order status)
  - `customer/application/CustomerService` (to update order history)
  - `notification/application/NotificationService` (for delivery confirmation)
  - `review/application/ReviewService` (to trigger review request)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Subscription Context Events

### SubscriptionCreated

- **Definition:** Fired when a new subscription is created.
- **Payload:** `{subscriptionId, customerId, planId, startDate, billingFrequency, initialTerm, status, paymentMethodId}`
- **Producer Context:** `subscription/application/SubscriptionService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update customer subscription status)
  - `analytics/application/AnalyticsService` (for subscription metrics)
  - `notification/application/NotificationService` (for subscription confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### SubscriptionRenewed

- **Definition:** Fired when a subscription is automatically renewed for another term.
- **Payload:** `{subscriptionId, customerId, previousEndDate, newEndDate, renewalDate, renewalTerm}`
- **Producer Context:** `subscription/application/SubscriptionService`
- **Consumer Context(s):** 
  - `order/application/OrderService` (to create renewal order)
  - `payment/application/PaymentService` (to process renewal payment)
  - `analytics/application/AnalyticsService` (for subscription metrics)
  - `notification/application/NotificationService` (for renewal confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### SubscriptionCancelled

- **Definition:** Fired when a subscription is cancelled by the customer or system.
- **Payload:** `{subscriptionId, customerId, cancellationDate, effectiveEndDate, cancellationReason, cancellationType, eligibleForReactivation}`
- **Producer Context:** `subscription/application/SubscriptionService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update customer subscription status)
  - `analytics/application/AnalyticsService` (for churn metrics)
  - `notification/application/NotificationService` (for cancellation confirmation)
  - `marketing/application/RetentionService` (for win-back campaigns)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### SubscriptionPlanChanged

- **Definition:** Fired when a subscription is upgraded, downgraded, or otherwise modified.
- **Payload:** `{subscriptionId, customerId, previousPlanId, newPlanId, changeDate, effectiveDate, prorationAmount, changeType}`
- **Producer Context:** `subscription/application/SubscriptionService`
- **Consumer Context(s):** 
  - `payment/application/PaymentService` (to process proration charges/credits)
  - `analytics/application/AnalyticsService` (for subscription metrics)
  - `notification/application/NotificationService` (for plan change confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### SubscriptionPaymentFailed

- **Definition:** Fired when a subscription renewal payment fails.
- **Payload:** `{subscriptionId, customerId, paymentId, failureDate, failureReason, retryCount, nextRetryDate, gracePeriodEndDate}`
- **Producer Context:** `subscription/application/SubscriptionService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update payment method status)
  - `notification/application/NotificationService` (for payment failure alerts)
  - `analytics/application/AnalyticsService` (for payment failure metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### SubscriptionPaused

- **Definition:** Fired when a subscription is temporarily paused.
- **Payload:** `{subscriptionId, customerId, pauseStartDate, scheduledResumeDate, pauseReason, pauseDuration}`
- **Producer Context:** `subscription/application/SubscriptionService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update subscription status)
  - `analytics/application/AnalyticsService` (for subscription metrics)
  - `notification/application/NotificationService` (for pause confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### SubscriptionResumed

- **Definition:** Fired when a paused subscription is resumed.
- **Payload:** `{subscriptionId, customerId, resumeDate, pauseDuration, nextBillingDate, adjustedEndDate}`
- **Producer Context:** `subscription/application/SubscriptionService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update subscription status)
  - `analytics/application/AnalyticsService` (for subscription metrics)
  - `notification/application/NotificationService` (for resume confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Marketing Context Events

### CampaignLaunched

- **Definition:** Fired when a marketing campaign is launched.
- **Payload:** `{campaignId, campaignName, campaignType, targetSegments[], startDate, endDate, channels[], budget}`
- **Producer Context:** `marketing/application/CampaignService`
- **Consumer Context(s):** 
  - `analytics/application/AnalyticsService` (for campaign tracking)
  - `notification/application/NotificationService` (for campaign notifications)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### PromotionCreated

- **Definition:** Fired when a new promotion or discount is created.
- **Payload:** `{promotionId, promotionCode, promotionType, discountValue, discountType, minimumOrderValue, startDate, endDate, applicableProducts[], applicableCategories[], maxUsesTotal, maxUsesPerCustomer}`
- **Producer Context:** `marketing/application/PromotionService`
- **Consumer Context(s):** 
  - `pricing/application/PricingService` (to apply promotions)
  - `order/application/CheckoutService` (to validate promotions)
  - `analytics/application/AnalyticsService` (for promotion tracking)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### PromotionRedeemed

- **Definition:** Fired when a promotion code is successfully applied to an order.
- **Payload:** `{promotionId, promotionCode, orderId, customerId, discountAmount, redeemedDate, remainingUses}`
- **Producer Context:** `order/application/CheckoutService`
- **Consumer Context(s):** 
  - `marketing/application/PromotionService` (to update usage counts)
  - `analytics/application/AnalyticsService` (for promotion effectiveness)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### CustomerEngagementRecorded

- **Definition:** Fired when a customer engages with marketing content (email open, click, etc.).
- **Payload:** `{engagementId, customerId, campaignId, contentId, engagementType, engagementDate, channelType, deviceType}`
- **Producer Context:** `marketing/application/EngagementService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update engagement history)
  - `analytics/application/AnalyticsService` (for engagement metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### AbandonedCartDetected

- **Definition:** Fired when a shopping cart is detected as abandoned after a configured time period.
- **Payload:** `{cartId, customerId, abandonmentDate, cartItems[], cartValue, lastActivityDate}`
- **Producer Context:** `order/application/CartService`
- **Consumer Context(s):** 
  - `marketing/application/RemarketingService` (for cart recovery campaigns)
  - `analytics/application/AnalyticsService` (for abandonment metrics)
  - `notification/application/NotificationService` (for recovery emails)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Review Context Events

### ReviewSubmitted

- **Definition:** Fired when a customer submits a product or service review.
- **Payload:** `{reviewId, customerId, productId, orderId, rating, reviewText, reviewDate, verifiedPurchase, mediaAttachments[]}`
- **Producer Context:** `review/application/ReviewService`
- **Consumer Context(s):** 
  - `catalog/application/ProductService` (to update product ratings)
  - `customer/application/CustomerService` (to update customer activity)
  - `analytics/application/AnalyticsService` (for review metrics)
  - `notification/application/NotificationService` (for review notifications)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ReviewModerated

- **Definition:** Fired when a review has been moderated and approved/rejected.
- **Payload:** `{reviewId, moderationStatus, moderationDate, moderationReason, moderatorId}`
- **Producer Context:** `review/application/ModerationService`
- **Consumer Context(s):** 
  - `review/application/ReviewService` (to update review status)
  - `catalog/application/ProductService` (to update product ratings if approved)
  - `notification/application/NotificationService` (for moderation notifications)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ReviewHelpfulnessVoted

- **Definition:** Fired when a customer votes on the helpfulness of a review.
- **Payload:** `{reviewId, customerId, voteType, voteDate, helpfulCount, unhelpfulCount}`
- **Producer Context:** `review/application/ReviewService`
- **Consumer Context(s):** 
  - `analytics/application/AnalyticsService` (for review engagement metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ReviewResponseAdded

- **Definition:** Fired when a seller or admin responds to a customer review.
- **Payload:** `{responseId, reviewId, responderId, responderType, responseText, responseDate}`
- **Producer Context:** `review/application/ReviewService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (to notify customer of response)
  - `analytics/application/AnalyticsService` (for review engagement metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Authentication Context Events

### UserLoggedIn

- **Definition:** Fired when a user successfully logs into the system.
- **Payload:** `{userId, loginTimestamp, deviceInfo, ipAddress, loginMethod, sessionId}`
- **Producer Context:** `auth/application/AuthenticationService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update last login)
  - `analytics/application/AnalyticsService` (for login metrics)
  - `security/application/SecurityService` (for anomaly detection)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### UserLoggedOut

- **Definition:** Fired when a user logs out of the system.
- **Payload:** `{userId, logoutTimestamp, sessionId, sessionDuration, logoutMethod}`
- **Producer Context:** `auth/application/AuthenticationService`
- **Consumer Context(s):** 
  - `analytics/application/AnalyticsService` (for session metrics)
  - `security/application/SecurityService` (for session tracking)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### LoginFailed

- **Definition:** Fired when a login attempt fails.
- **Payload:** `{userId, attemptTimestamp, failureReason, deviceInfo, ipAddress, attemptCount}`
- **Producer Context:** `auth/application/AuthenticationService`
- **Consumer Context(s):** 
  - `security/application/SecurityService` (for threat detection)
  - `analytics/application/AnalyticsService` (for security metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### PasswordChanged

- **Definition:** Fired when a user changes their password.
- **Payload:** `{userId, changeTimestamp, initiatedBy, changeMethod, requiresRelogin}`
- **Producer Context:** `auth/application/CredentialService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (for security notifications)
  - `security/application/SecurityService` (for security monitoring)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### AccountLocked

- **Definition:** Fired when a user account is locked due to security concerns.
- **Payload:** `{userId, lockTimestamp, lockReason, lockDuration, unlockEligibilityDate}`
- **Producer Context:** `auth/application/SecurityService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update account status)
  - `notification/application/NotificationService` (for lock notifications)
  - `analytics/application/AnalyticsService` (for security metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### TwoFactorAuthenticationEnabled

- **Definition:** Fired when a user enables two-factor authentication.
- **Payload:** `{userId, enabledTimestamp, methodType, deviceInfo}`
- **Producer Context:** `auth/application/TwoFactorService`
- **Consumer Context(s):** 
  - `customer/application/CustomerService` (to update security settings)
  - `notification/application/NotificationService` (for security notifications)
  - `analytics/application/AnalyticsService` (for security metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Catalog Authentication Context Events

### ProductAuthenticationRequested

- **Definition:** Fired when a product authentication scan is initiated.
- **Payload:** `{requestId, productId, sku, scanMethod, scanLocation, scanTimestamp, scannerDeviceId, scannerUserId}`
- **Producer Context:** `catalogAuthentication/application/ScanningService`
- **Consumer Context(s):** 
  - `catalogAuthentication/application/AuthenticationService` (to process authentication)
  - `analytics/application/AnalyticsService` (for authentication metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ProductAuthenticated

- **Definition:** Fired when a product is successfully authenticated as genuine.
- **Payload:** `{requestId, productId, sku, authenticationResult, confidenceScore, authenticationMethod, authenticationTimestamp, authenticatedBy}`
- **Producer Context:** `catalogAuthentication/application/AuthenticationService`
- **Consumer Context(s):** 
  - `catalog/application/ProductService` (to update authentication status)
  - `customer/application/CustomerService` (to update authentication history)
  - `analytics/application/AnalyticsService` (for authentication metrics)
  - `notification/application/NotificationService` (for authentication confirmation)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### CounterfeitDetected

- **Definition:** Fired when a product is identified as counterfeit during authentication.
- **Payload:** `{requestId, productId, sku, detectionMethod, confidenceScore, detectionTimestamp, detectionLocation, evidenceDetails}`
- **Producer Context:** `catalogAuthentication/application/AuthenticationService`
- **Consumer Context(s):** 
  - `security/application/FraudService` (to track counterfeit incidents)
  - `analytics/application/AnalyticsService` (for counterfeit metrics)
  - `notification/application/NotificationService` (for security alerts)
  - `compliance/application/ComplianceService` (for regulatory reporting)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### AuthenticationMethodUpdated

- **Definition:** Fired when a product's authentication method or security features are updated.
- **Payload:** `{productId, sku, previousMethod, newMethod, updateTimestamp, updatedBy, effectiveDate, securityFeatures[]}`
- **Producer Context:** `catalogAuthentication/application/AuthenticationManagementService`
- **Consumer Context(s):** 
  - `catalog/application/ProductService` (to update product information)
  - `analytics/application/AnalyticsService` (for authentication metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### AuthenticationAnomalyDetected

- **Definition:** Fired when unusual patterns are detected in authentication attempts.
- **Payload:** `{anomalyId, productId, anomalyType, detectionTimestamp, affectedRegion, anomalyScore, anomalyDetails}`
- **Producer Context:** `catalogAuthentication/application/AnomalyDetectionService`
- **Consumer Context(s):** 
  - `security/application/FraudService` (for investigation)
  - `analytics/application/AnalyticsService` (for security metrics)
  - `notification/application/NotificationService` (for security alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Notification Context Events

### NotificationCreated

- **Definition:** Fired when a new notification is created for delivery.
- **Payload:** `{notificationId, recipientId, notificationType, channel, priority, content, metadata, creationTimestamp, scheduledDeliveryTime}`
- **Producer Context:** `notification/application/NotificationService`
- **Consumer Context(s):** 
  - `notification/application/DeliveryService` (to deliver the notification)
  - `analytics/application/AnalyticsService` (for notification metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### NotificationDelivered

- **Definition:** Fired when a notification is successfully delivered to the intended channel.
- **Payload:** `{notificationId, recipientId, channel, deliveryTimestamp, deliveryMetadata}`
- **Producer Context:** `notification/application/DeliveryService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (to update notification status)
  - `analytics/application/AnalyticsService` (for delivery metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### NotificationFailed

- **Definition:** Fired when a notification delivery attempt fails.
- **Payload:** `{notificationId, recipientId, channel, failureTimestamp, failureReason, retryCount, nextRetryTime}`
- **Producer Context:** `notification/application/DeliveryService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (to update notification status)
  - `notification/application/RetryService` (to schedule retries)
  - `analytics/application/AnalyticsService` (for failure metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### NotificationRead

- **Definition:** Fired when a recipient reads or views a notification.
- **Payload:** `{notificationId, recipientId, readTimestamp, deviceInfo, readContext}`
- **Producer Context:** `notification/application/TrackingService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (to update notification status)
  - `analytics/application/AnalyticsService` (for engagement metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### NotificationPreferencesUpdated

- **Definition:** Fired when a user updates their notification preferences.
- **Payload:** `{customerId, updatedChannels{}, updatedCategories{}, updateTimestamp}`
- **Producer Context:** `customer/application/PreferenceService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (to apply new preferences)
  - `analytics/application/AnalyticsService` (for preference metrics)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Analytics Context Events

### UserActivityRecorded

- **Definition:** Fired when significant user activity is recorded for analytics purposes.
- **Payload:** `{activityId, userId, activityType, timestamp, sessionId, pageUrl, deviceInfo, activityDetails}`
- **Producer Context:** `analytics/application/TrackingService`
- **Consumer Context(s):** 
  - `analytics/application/AnalyticsService` (for user behavior analysis)
  - `customer/application/CustomerService` (for activity history)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### BusinessMetricCalculated

- **Definition:** Fired when a key business metric is calculated or updated.
- **Payload:** `{metricId, metricName, metricValue, calculationTimestamp, timeRange, dimensions{}, previousValue}`
- **Producer Context:** `analytics/application/MetricsService`
- **Consumer Context(s):** 
  - `analytics/application/DashboardService` (for dashboard updates)
  - `notification/application/NotificationService` (for metric alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ReportGenerated

- **Definition:** Fired when an analytics report is generated.
- **Payload:** `{reportId, reportType, generationTimestamp, parameters{}, resultUrl, recipientIds[]}`
- **Producer Context:** `analytics/application/ReportingService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (for report notifications)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### AnomalyDetected

- **Definition:** Fired when an anomaly is detected in business metrics or user behavior.
- **Payload:** `{anomalyId, metricId, detectionTimestamp, expectedValue, actualValue, deviationPercentage, severity, anomalyType}`
- **Producer Context:** `analytics/application/AnomalyDetectionService`
- **Consumer Context(s):** 
  - `notification/application/NotificationService` (for anomaly alerts)
  - `security/application/SecurityService` (for security-related anomalies)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

### ForecastUpdated

- **Definition:** Fired when a business forecast is generated or updated.
- **Payload:** `{forecastId, metricId, generationTimestamp, forecastPeriod, forecastValues[], confidenceInterval, previousForecast[]}`
- **Producer Context:** `analytics/application/ForecastingService`
- **Consumer Context(s):** 
  - `inventory/application/PlanningService` (for inventory forecasts)
  - `marketing/application/CampaignService` (for marketing forecasts)
  - `notification/application/NotificationService` (for forecast alerts)
- **Delivery Guarantee:** At-least-once via RabbitMQ topic exchange

## Summary and Governance

This Domain Event Catalog documents the key domain events across all bounded contexts in the Elias Food Imports system. It serves as a reference for developers, domain experts, and other stakeholders to understand how information flows through the system.

### Governance

1. **Event Evolution:** When modifying existing events or creating new ones, follow the naming conventions and structure defined in the Domain Event Naming Analysis document.

2. **Consistency:** All events must align with the Ubiquitous Language Glossary and follow the entity-first, past-tense naming convention.

3. **Documentation:** Any new events must be added to this catalog with complete information about payload, producers, and consumers.

4. **Review Process:** Changes to existing events or new event definitions must be reviewed by domain experts and technical leads to ensure alignment with business processes and technical requirements.

5. **Versioning:** Major changes to event schemas should be versioned appropriately to maintain backward compatibility.

### Integration with Requirements

This catalog directly supports the implementation of requirements defined in the Requirements→Context Matrix, providing the technical mechanism for state changes and cross-context communication required by the business requirements.
