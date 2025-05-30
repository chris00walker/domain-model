# Customer Bounded Context

## Domain Description

The Customer bounded context manages all aspects related to customers in the Elias Food Imports (EFI) system. It handles different types of customers, their contact information, preferences, and relationship with the business.

## Key Concepts

### Customer Segmentation

EFI serves different customer segments, each with unique needs and characteristics:

#### B2C Segments:
- **Diaspora Community**: Customers with cultural ties to Caribbean food
- **Tourists**: Visitors who encountered products while traveling
- **Expats**: Caribbean nationals living abroad
- **Indigenous Foodie**: Local food enthusiasts

#### B2B Segments:
- **Food Truck**: Mobile food vendors
- **Private Chef**: Independent culinary professionals
- **Specialty Market**: Niche food retailers
- **Limited/Full Service Restaurant**: Dining establishments
- **Hotel Restaurant**: Food service within hospitality

#### Future Segments (Phase 2 & 3):
- **Importer**
- **Regional Supermarket**
- **Cruise Line Provisioner**
- **International Retailer**

## Domain Model

### Aggregate Roots

#### Customer (Abstract Base Class)

The core entity that defines common behavior for all customer types.

```typescript
abstract class Customer extends AggregateRoot<CustomerProps> {
  // Common customer properties and behaviors
}
```

Key properties:
- `customerId`: Unique identifier
- `name`: Customer name
- `type`: Customer segment type
- `contactInfo`: Contact information
- `defaultShippingAddress`: Where products are delivered
- `defaultBillingAddress`: Where invoices are sent

#### ExpatCustomer

Specialization of Customer for expatriates living abroad.

```typescript
class ExpatCustomer extends Customer {
  // Expat-specific properties and behaviors
}
```

Unique properties:
- `countryOfOrigin`: Country of origin
- `residencyStatus`: Current residency status (PERMANENT, TEMPORARY, WORK_PERMIT)
- `residenceDuration`: How long they've been residents (in months)
- `dietaryPreferences`: Specific food preferences
- `hasSubscription`: Whether they subscribe to regular deliveries
- `preferredDeliveryDay`: Preferred day for delivery
- `preferredDeliveryFrequency`: How often they want deliveries

#### IndigenousFoodieCustomer

Specialization for local food enthusiasts.

```typescript
class IndigenousFoodieCustomer extends Customer {
  // Foodie-specific properties and behaviors
}
```

Unique properties:
- `culinaryInterests`: Types of cuisine they're interested in
- `cookingExperienceLevel`: Cooking skill level (BEGINNER, INTERMEDIATE, ADVANCED)
- `familySize`: Size of household
- `dietaryRestrictions`: Dietary limitations
- `preferredMealTypes`: Types of meals they prefer
- `hasSampledBefore`: Whether they've sampled EFI products before

### Value Objects

#### CustomerId

Immutable identifier for customers.

```typescript
class CustomerId extends ValueObject<CustomerIdProps> {
  // CustomerId implementation
}
```

#### CustomerType

Enum representing all customer segment types.

```typescript
enum CustomerType {
  DiasporaCommunity = 'DIASPORA_COMMUNITY',
  Tourist = 'TOURIST',
  // Other types...
}
```

#### ContactInfo

Value object encapsulating customer contact information.

```typescript
class ContactInfo extends ValueObject<ContactInfoProps> {
  // ContactInfo implementation
}
```

Properties:
- `email`: Primary email address
- `phone`: Contact phone number
- `altPhone`: Alternative phone number
- `preferredContactMethod`: How the customer prefers to be contacted

### Domain Events

#### CustomerCreated

Event triggered when a new customer is created.

```typescript
class CustomerCreated extends DomainEvent {
  // CustomerCreated implementation
}
```

### Domain Services

#### CustomerFactory

Service responsible for creating appropriate customer instances based on type.

```typescript
class CustomerFactory {
  static createCustomer(
    customerType: CustomerType,
    props: any,
    id?: UniqueEntityID
  ): Result<Customer, string> {
    // Factory implementation
  }
}
```

## Business Rules

1. Every customer must have a name, type, and contact information
2. Contact information must include at least one valid contact method
3. Expat customers must specify their country of origin and residency status
4. Expat customers with subscriptions must specify delivery preferences
5. Indigenous foodie customers must specify at least one culinary interest
6. Family size for indigenous foodie customers must be greater than zero

## Integration Points

- **Orders Bounded Context**: Customers place orders
- **Subscription Bounded Context**: Customers may have subscription plans
- **Payments Bounded Context**: Customers have payment methods and history
