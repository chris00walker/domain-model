import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { Result, failure } from '@shared/core/Result';
import { Customer } from '../aggregates/Customer';
import { CustomerType } from '../value-objects/CustomerType';
import { DiasporaCustomer } from '../aggregates/DiasporaCustomer';
import { TouristCustomer } from '../aggregates/TouristCustomer';
import { ExpatCustomer } from '../aggregates/ExpatCustomer';
import { IndigenousFoodieCustomer } from '../aggregates/IndigenousFoodieCustomer';
import { FoodTruckCustomer } from '../aggregates/FoodTruckCustomer';
import { SpecialtyMarketCustomer } from '../aggregates/SpecialtyMarketCustomer';
import { PrivateChefCustomer } from '../aggregates/PrivateChefCustomer';
import { LimitedServiceRestaurantCustomer } from '../aggregates/LimitedServiceRestaurantCustomer';
import { FullServiceRestaurantCustomer } from '../aggregates/FullServiceRestaurantCustomer';
import { HotelRestaurantCustomer } from '../aggregates/HotelRestaurantCustomer';

export class CustomerFactory {
  /**
   * Creates a customer of the specified type with the provided properties
   * @param customerType The type of customer to create
   * @param props The properties for the customer
   * @param id Optional unique entity ID
   * @returns Result containing the created customer or an error message
   */
  public static createCustomer(
    customerType: CustomerType,
    props: any,
    id?: UniqueEntityID
  ): Result<Customer, string> {
    switch (customerType) {
      case CustomerType.DiasporaCommunity:
        return DiasporaCustomer.create(props, id);
      
      case CustomerType.Tourist:
        return TouristCustomer.create(props, id);
      
      case CustomerType.Expat:
        return ExpatCustomer.create(props, id);
      
      case CustomerType.IndigenousFoodie:
        return IndigenousFoodieCustomer.create(props, id);
      
      case CustomerType.FoodTruck:
        return FoodTruckCustomer.create(props, id);
        
      case CustomerType.SpecialtyMarket:
        return SpecialtyMarketCustomer.create(props, id);
        
      case CustomerType.PrivateChef:
        return PrivateChefCustomer.create(props, id);
        
      case CustomerType.LimitedServiceRestaurant:
        return LimitedServiceRestaurantCustomer.create(props, id);
        
      case CustomerType.FullServiceRestaurant:
        return FullServiceRestaurantCustomer.create(props, id);
        
      case CustomerType.HotelRestaurant:
        return HotelRestaurantCustomer.create(props, id);
      
      // Add additional customer types as they are implemented
      
      default:
        return failure<Customer, string>(`Unsupported customer type: ${customerType}`);
    }
  }
}
