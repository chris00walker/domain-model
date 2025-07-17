/**
 * CustomerSegmentType Value Object
 * 
 * An enumeration representing the different segments of customers within each customer type.
 * This provides a more granular classification of customers beyond the basic customer types.
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
export enum CustomerSegmentType {
  // B2C Segments - Diaspora Community
  DiasporaNewcomer = 'DIASPORA_NEWCOMER',
  DiasporaNewArrival = 'DIASPORA_NEW_ARRIVAL',
  DiasporaEstablished = 'DIASPORA_ESTABLISHED',
  DiasporaSecondGeneration = 'DIASPORA_SECOND_GENERATION',
  
  // B2C Segments - Tourist
  TouristCulinaryExplorer = 'TOURIST_CULINARY_EXPLORER',
  TouristCasual = 'TOURIST_CASUAL',
  TouristHomesick = 'TOURIST_HOMESICK',
  
  // B2C Segments - Expat
  ExpatNewArrival = 'EXPAT_NEW_ARRIVAL',
  ExpatLongTerm = 'EXPAT_LONG_TERM',
  ExpatReturning = 'EXPAT_RETURNING',
  
  // B2C Segments - Indigenous Foodie
  FoodieEnthusiast = 'FOODIE_ENTHUSIAST',
  FoodieInfluencer = 'FOODIE_INFLUENCER',
  FoodieChef = 'FOODIE_CHEF',
  
  // B2B Segments - Food Truck
  FoodTruckStartup = 'FOOD_TRUCK_STARTUP',
  FoodTruckEstablished = 'FOOD_TRUCK_ESTABLISHED',
  FoodTruckChain = 'FOOD_TRUCK_CHAIN',
  
  // B2B Segments - Private Chef
  PrivateChefIndependent = 'PRIVATE_CHEF_INDEPENDENT',
  PrivateChefCatering = 'PRIVATE_CHEF_CATERING',
  PrivateChefCelebrity = 'PRIVATE_CHEF_CELEBRITY',
  SpecialtyChef = 'SPECIALTY_CHEF',
  
  // B2B Segments - Specialty Market
  SpecialtyMarketSmall = 'SPECIALTY_MARKET_SMALL',
  SpecialtyMarketMedium = 'SPECIALTY_MARKET_MEDIUM',
  SpecialtyMarketLarge = 'SPECIALTY_MARKET_LARGE',
  
  // B2B Segments - Limited Service Restaurant
  LimitedServiceNew = 'LIMITED_SERVICE_NEW',
  LimitedServiceEstablished = 'LIMITED_SERVICE_ESTABLISHED',
  LimitedServiceChain = 'LIMITED_SERVICE_CHAIN',
  
  // B2B Segments - Full Service Restaurant
  FullServiceIndependent = 'FULL_SERVICE_INDEPENDENT',
  FullServiceChain = 'FULL_SERVICE_CHAIN',
  FullServiceFine = 'FULL_SERVICE_FINE',
  
  // B2B Segments - Hotel Restaurant
  HotelRestaurantBoutique = 'HOTEL_RESTAURANT_BOUTIQUE',
  HotelRestaurantMidscale = 'HOTEL_RESTAURANT_MIDSCALE',
  HotelRestaurantLuxury = 'HOTEL_RESTAURANT_LUXURY',
  
  // Phase 2 & 3 Segments
  ImporterSmall = 'IMPORTER_SMALL',
  ImporterMedium = 'IMPORTER_MEDIUM',
  ImporterLarge = 'IMPORTER_LARGE',
  
  RegionalSupermarketLocal = 'REGIONAL_SUPERMARKET_LOCAL',
  RegionalSupermarketRegional = 'REGIONAL_SUPERMARKET_REGIONAL',
  RegionalSupermarketNational = 'REGIONAL_SUPERMARKET_NATIONAL',
  
  CruiseLineSmall = 'CRUISE_LINE_SMALL',
  CruiseLineMedium = 'CRUISE_LINE_MEDIUM',
  CruiseLineLarge = 'CRUISE_LINE_LARGE',
  
  RetailerLocal = 'RETAILER_LOCAL',
  RetailerRegional = 'RETAILER_REGIONAL',
  RetailerGlobal = 'RETAILER_GLOBAL'
}
