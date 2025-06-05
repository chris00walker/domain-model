# Ubiquitous Language in UI Design

## Purpose

This document provides guidance on integrating the ubiquitous language into user interface design for Elias Food Imports. Consistent terminology between the domain model and user interfaces ensures that domain concepts are properly represented to end users, reducing confusion and improving the overall user experience.

## Importance of UI Terminology Alignment

User interfaces are where domain concepts become visible to end users. When UI terminology aligns with the ubiquitous language:

1. **Reduced User Confusion**: Users encounter consistent terminology across all touchpoints
2. **Improved Communication**: Support staff and users can discuss features using the same language
3. **Better Training Materials**: Training and help documentation naturally align with the application
4. **Faster User Adoption**: Users can more quickly understand the system's capabilities and purpose
5. **Reduced Translation Errors**: Fewer errors from mistranslating between UI terms and domain concepts

## UI Design Principles

### 1. Page and View Naming

Page and view names should reflect domain concepts from the ubiquitous language:

| Domain Concept | UI Page/View Name | Example |
|----------------|------------------|---------|
| Customer | Customer Details | View of a specific customer's information |
| Subscription | Subscription Management | Interface for managing subscriptions |
| Order | Order Details | View of a specific order's information |
| Product Catalog | Product Catalog | Browsable list of available products |

**Guidelines:**

- Use clear, descriptive names based on domain concepts
- Avoid technical terms like "entity" or "aggregate" in page names
- Be consistent with naming patterns across similar pages
- Consider user perspective when naming pages (e.g., "My Orders" vs "Orders")

### 2. Form Field Naming

Form field labels should match attributes of domain objects:

| Domain Object Property | Form Field Label | Notes |
|-----------------------|------------------|-------|
| Customer.name | Name | Direct match |
| Customer.customerType | Customer Type | Direct match with proper spacing |
| Product.productOrigin | Product Origin | Direct match with proper spacing |
| Order.deliveryAddress | Delivery Address | Direct match with proper spacing |

**Guidelines:**

- Use proper sentence case for field labels
- Use the exact term from the glossary for the field label
- Avoid technical abbreviations
- Be consistent with terminology across all forms

### 3. Button and Action Naming

Button and action labels should reflect domain operations and commands:

| Domain Operation | Button/Action Label | Example Context |
|------------------|---------------------|----------------|
| PlaceOrder | Place Order | On checkout page |
| CancelOrder | Cancel Order | In order management |
| PauseSubscription | Pause Subscription | In subscription details |
| AuthenticateProduct | Verify Authenticity | On product details page |

**Guidelines:**

- Use imperative verb phrases for action buttons
- Match the verb to the domain operation name
- Be consistent with verb usage across similar actions
- Consider user-friendly phrasing while maintaining domain alignment

### 4. Navigation Menu Naming

Navigation menu items should reflect major domain areas:

| Domain Area | Menu Item | Notes |
|-------------|-----------|-------|
| Customer Management | Customers | Section for customer-related activities |
| Subscription Management | Subscriptions | Section for subscription-related activities |
| Order Processing | Orders | Section for order-related activities |
| Product Catalog | Products | Section for product-related activities |

**Guidelines:**

- Use plural nouns for collection-based sections
- Use the exact term from the glossary for the menu item
- Group related items based on domain relationships
- Consider user roles and permissions when organizing menus

### 5. Error and Notification Messages

Error and notification messages should use domain terminology:

| Domain Rule | Error/Notification Message | Context |
|-------------|----------------------------|---------|
| Minimum Order Amount | "Order total must be at least $100" | During checkout |
| Product Authentication | "Product authentication failed" | During product verification |
| Subscription Frequency | "Please select a valid delivery frequency" | When creating a subscription |

**Guidelines:**

- Use domain terms to describe the condition
- Provide actionable information for resolving issues
- Maintain a consistent tone and structure across messages
- Avoid technical jargon unless it's part of the ubiquitous language

## UI Component Patterns

### 1. Data Display Components

Components that display domain data should use consistent terminology:

| Domain Concept | UI Component | Example Implementation |
|----------------|--------------|------------------------|
| Order Status | Status Badge | Color-coded badge showing current order status |
| Subscription Plan | Plan Card | Card displaying subscription plan details |
| Product Category | Category Filter | Filter control for product categories |

**Guidelines:**

- Name components based on the domain concept they represent
- Use consistent visual patterns for similar domain concepts
- Document the mapping between domain concepts and UI components
- Consider accessibility when designing components

### 2. Data Input Components

Components for data input should align with domain constraints:

| Domain Constraint | UI Implementation | Example |
|-------------------|-------------------|---------|
| Valid Delivery Frequencies | Dropdown with valid options | Weekly, Bi-weekly, Monthly options |
| Customer Segments | Radio buttons with segment options | Retail, Wholesale, Distributor options |
| Product Authentication Code | Formatted text input | Input with format validation for authentication codes |

**Guidelines:**

- Choose input types that naturally enforce domain constraints
- Use domain terminology in input labels and help text
- Provide validation that aligns with domain rules
- Consider the user's context and knowledge when designing inputs

## UI Text Guidelines

### 1. Glossary Alignment

All UI text should align with the domain glossary:

| Glossary Term | Correct UI Usage | Incorrect UI Usage |
|---------------|------------------|-------------------|
| Subscription | "Manage your subscription" | "Manage your recurring order" |
| Line Item | "Add line items to your order" | "Add products to your order" |
| Product Authentication | "Verify product authenticity" | "Check if product is real" |

**Guidelines:**

- Maintain a UI text glossary that maps to the domain glossary
- Review all UI text for terminology consistency
- Train content writers on the ubiquitous language
- Establish a process for updating UI text when terminology changes

### 2. Contextual Help and Tooltips

Help text and tooltips should explain domain concepts:

| Domain Concept | Tooltip/Help Text Example |
|----------------|---------------------------|
| Customer Segment | "Your customer segment determines pricing and available products" |
| Delivery Frequency | "How often you'll receive your subscription items" |
| Product Origin | "The country or region where this product was produced" |

**Guidelines:**

- Use tooltips to explain domain-specific terminology
- Keep help text concise but informative
- Link to more detailed documentation when needed
- Use consistent formatting for help text across the application

## Implementation Process

### 1. UI Design Review

Establish a review process for UI designs:

1. **Terminology Review**: Check all UI text against the domain glossary
2. **Consistency Check**: Ensure consistent terminology across related screens
3. **Domain Expert Review**: Have domain experts review UI designs
4. **User Testing**: Test terminology understanding with actual users

### 2. UI Component Library

Create a component library aligned with the ubiquitous language:

1. **Name components based on domain concepts**
2. **Document the domain meaning of each component**
3. **Establish patterns for similar domain concepts**
4. **Include domain terminology in component APIs**

### 3. Content Style Guide

Develop a content style guide for UI text:

1. **Include the domain glossary as a reference**
2. **Provide examples of correct and incorrect terminology usage**
3. **Establish voice and tone guidelines that respect domain concepts**
4. **Create templates for common UI text patterns**

## Handling Multiple User Roles

Different user roles may require different terminology:

| User Role | Domain Concept | Adapted UI Term | Reason |
|-----------|---------------|-----------------|--------|
| Customer | Subscription Plan | Membership Plan | More familiar to end customers |
| Admin | Subscription Plan | Subscription Plan | Direct use of domain terminology |
| Customer | Authentication Code | Verification Code | More intuitive for customers |
| Admin | Authentication Code | Authentication Code | Direct use of domain terminology |

**Guidelines:**

- Document any terminology adaptations for specific user roles
- Maintain the core meaning of domain concepts even when adapting terminology
- Consider creating role-specific glossaries if needed
- Test terminology understanding with users from each role

## Common Anti-patterns

### 1. Inconsistent Terminology

**Anti-pattern**: Using "Order" and "Purchase" interchangeably  
**Better approach**: Consistently use "Order" throughout the UI

### 2. Technical Terminology

**Anti-pattern**: Exposing technical terms like "Aggregate" or "Entity"  
**Better approach**: Use business-focused domain terminology

### 3. Generic Labels

**Anti-pattern**: Generic button labels like "Submit" or "Save"  
**Better approach**: Domain-specific labels like "Place Order" or "Update Subscription"

### 4. Inconsistent Capitalization

**Anti-pattern**: Mixing "customer type" and "Customer Type"  
**Better approach**: Consistent capitalization based on style guide

### 5. Abbreviated Terms

**Anti-pattern**: Using abbreviations like "Cust" or "Ord"  
**Better approach**: Use full terms from the ubiquitous language

## Example UI Implementation

### Customer Management Screen

```html
<h1>Customer Details</h1>

<div class="customer-profile">
  <h2>{{customer.name}}</h2>
  <div class="customer-type-badge">{{customer.customerType}}</div>
  <div class="customer-segment-badge">{{customer.customerSegment}}</div>
  
  <h3>Contact Information</h3>
  <div class="contact-info">
    <div>Email: {{customer.email}}</div>
    <div>Phone: {{customer.phone}}</div>
  </div>
  
  <h3>Delivery Addresses</h3>
  <div class="address-list">
    <div class="address-card" v-for="address in customer.deliveryAddresses">
      <div class="address-type">{{address.addressType}}</div>
      <div class="address-details">
        {{address.street}}<br>
        {{address.city}}, {{address.state}} {{address.postalCode}}<br>
        {{address.country}}
      </div>
      <button class="edit-button">Edit Address</button>
    </div>
    <button class="add-button">Add Delivery Address</button>
  </div>
</div>

<div class="customer-actions">
  <button class="primary-button">Update Customer</button>
  <button class="secondary-button">View Order History</button>
  <button class="secondary-button">Manage Subscriptions</button>
</div>
```

### Order Creation Form

```html
<h1>Create New Order</h1>

<form class="order-form">
  <div class="form-section">
    <h2>Customer Information</h2>
    <div class="form-field">
      <label for="customer">Customer</label>
      <select id="customer" v-model="order.customerId">
        <option v-for="customer in customers" :value="customer.id">
          {{customer.name}} ({{customer.customerType}})
        </option>
      </select>
    </div>
  </div>
  
  <div class="form-section">
    <h2>Delivery Information</h2>
    <div class="form-field">
      <label for="deliveryAddress">Delivery Address</label>
      <select id="deliveryAddress" v-model="order.deliveryAddressId">
        <option v-for="address in customerAddresses" :value="address.id">
          {{address.street}}, {{address.city}}
        </option>
      </select>
    </div>
    
    <div class="form-field">
      <label for="requestedDeliveryDate">Requested Delivery Date</label>
      <input type="date" id="requestedDeliveryDate" v-model="order.requestedDeliveryDate">
    </div>
  </div>
  
  <div class="form-section">
    <h2>Line Items</h2>
    <div class="line-item" v-for="(item, index) in order.lineItems">
      <div class="form-field">
        <label :for="'product-'+index">Product</label>
        <select :id="'product-'+index" v-model="item.productId">
          <option v-for="product in availableProducts" :value="product.id">
            {{product.name}} ({{product.productOrigin}})
          </option>
        </select>
      </div>
      
      <div class="form-field">
        <label :for="'quantity-'+index">Quantity</label>
        <input type="number" :id="'quantity-'+index" v-model="item.quantity" min="1">
      </div>
      
      <button class="remove-button" @click="removeLineItem(index)">Remove Line Item</button>
    </div>
    
    <button class="add-button" @click="addLineItem">Add Line Item</button>
  </div>
  
  <div class="order-summary">
    <h2>Order Summary</h2>
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>{{formatCurrency(order.subtotal)}}</span>
    </div>
    <div class="summary-row">
      <span>Delivery Fee:</span>
      <span>{{formatCurrency(order.deliveryFee)}}</span>
    </div>
    <div class="summary-row total">
      <span>Total:</span>
      <span>{{formatCurrency(order.total)}}</span>
    </div>
  </div>
  
  <div class="form-actions">
    <button type="submit" class="primary-button">Place Order</button>
    <button type="button" class="secondary-button">Save Draft</button>
    <button type="button" class="cancel-button">Cancel</button>
  </div>
</form>
```

## Conclusion

Aligning user interface design with the ubiquitous language creates a more cohesive user experience and strengthens the connection between the domain model and user interactions. By following the guidelines in this document, teams can create interfaces that naturally express domain concepts and facilitate clear communication between users and the system.

---
*This document should be reviewed and updated as the domain model and user interfaces evolve. Last updated: 2025-06-04*
