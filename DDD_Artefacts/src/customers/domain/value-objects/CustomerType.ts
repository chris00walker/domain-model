/**
 * CustomerType Value Object
 * 
 * An enumeration representing the different types of customers in the system.
 * Enums are an effective way to model a finite set of domain concepts with 
 * static values that are known at design time.
 * 
 * Domain-Driven Design Value Object Pattern
 * 
 * Value Objects are immutable objects that have no identity but describe domain concepts.
 * They are used to measure, quantify, or describe things in the domain model.
 * 
 * Key characteristics:
 * 1. Immutability - Cannot be changed after creation
 * 2. Value equality - Two value objects with same attributes are considered equal
 * 3. No identity - Value objects don't have a unique identifier
 * 4. Self-validation - Ensures the attributes follow domain rules
 */
export enum CustomerType {
  // B2C Segments
  DiasporaCommunity = 'DIASPORA_COMMUNITY',
  Tourist = 'TOURIST',
  Expat = 'EXPAT',
  IndigenousFoodie = 'INDIGENOUS_FOODIE',
  
  // B2B Segments
  FoodTruck = 'FOOD_TRUCK',
  PrivateChef = 'PRIVATE_CHEF',
  SpecialtyMarket = 'SPECIALTY_MARKET',
  LimitedServiceRestaurant = 'LIMITED_SERVICE_RESTAURANT',
  FullServiceRestaurant = 'FULL_SERVICE_RESTAURANT',
  HotelRestaurant = 'HOTEL_RESTAURANT',
  
  // Phase 2 & 3 Segments
  Importer = 'IMPORTER',
  RegionalSupermarket = 'REGIONAL_SUPERMARKET',
  CruiseLineProvisioner = 'CRUISE_LINE_PROVISIONER',
  InternationalRetailer = 'INTERNATIONAL_RETAILER'
}
