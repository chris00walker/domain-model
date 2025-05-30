import { CustomerId } from '@customers/domain/value-objects/CustomerId';
import { ContactInfo } from '@customers/domain/value-objects/ContactInfo';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { ExpatCustomer } from '@customers/domain/aggregates/ExpatCustomer';
import { CustomerType } from '@customers/domain/value-objects/CustomerType';
import { CustomerCreated } from '@customers/domain/events/CustomerCreated';

describe('Customers Domain - ExpatCustomer', () => {
  // Helper functions to create test objects
  const createValidContactInfo = () => {
    const contactInfoResult = ContactInfo.create({
      email: 'test@example.com',
      phone: '+1234567890',
      preferredContactMethod: 'EITHER'
    });

    if (contactInfoResult.isFailure()) {
      throw new Error('Failed to create contact info: ' + contactInfoResult.error);
    }
    
    return contactInfoResult.value;
  };

  // Base properties for creating a valid expatriate customer
  const validExpatProps = {
    name: 'John Doe',
    contactInfo: createValidContactInfo(),
    countryOfOrigin: 'United Kingdom',
    residencyStatus: 'PERMANENT' as const,
    residenceDuration: 24, // 24 months
    hasSubscription: false,
    dietaryPreferences: ['Vegan', 'Gluten-Free']
  };

  // Test configuration for subscription customers
  const subscriptionProps = {
    ...validExpatProps,
    hasSubscription: true,
    preferredDeliveryDay: 'MONDAY' as const,
    preferredDeliveryFrequency: 'WEEKLY' as const
  };

  describe('Value Objects', () => {
    describe('CustomerId', () => {
      it('should create a valid CustomerId', () => {
        const result = CustomerId.create('customer-123');
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value.value).toBe('customer-123');
        }
      });
      
      it('should allow empty string as CustomerId', () => {
        // The current implementation only guards against null/undefined, not empty strings
        const result = CustomerId.create('');
        expect(result.isSuccess()).toBe(true);
      });

      it('should reject null CustomerId', () => {
        const result = CustomerId.create(null as unknown as string);
        expect(result.isFailure()).toBe(true);
      });
    });

    describe('ContactInfo', () => {
      it('should create valid contact information', () => {
        const result = ContactInfo.create({
          email: 'test@example.com',
          phone: '+1234567890',
          preferredContactMethod: 'EITHER'
        });
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const contactInfo = result.value;
          expect(contactInfo.email).toBe('test@example.com');
          expect(contactInfo.phone).toBe('+1234567890');
        }
      });
    });
  });

  describe('ExpatCustomer Aggregate', () => {
    describe('creation', () => {
      it('should create an expat customer with valid properties', () => {
        const result = ExpatCustomer.create(validExpatProps);
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const customer = result.value;
          expect(customer.countryOfOrigin).toBe('United Kingdom');
          expect(customer.residencyStatus).toBe('PERMANENT');
          expect(customer.residenceDuration).toBe(24);
          expect(customer.hasSubscription).toBe(false);
          expect(customer.dietaryPreferences).toEqual(['Vegan', 'Gluten-Free']);
          expect(customer.type).toBe(CustomerType.Expat);
        }
      });

      it('should assign a unique ID when not provided', () => {
        const result = ExpatCustomer.create(validExpatProps);
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const customer = result.value;
          expect(customer.id).toBeDefined();
        }
      });

      it('should use provided ID when specified', () => {
        const customerId = new UniqueEntityID('customer-123');
        const result = ExpatCustomer.create(validExpatProps, customerId);
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const customer = result.value;
          expect(customer.id.toString()).toBe('customer-123');
        }
      });

      it('should add CustomerCreated domain event when creating a new customer', () => {
        const result = ExpatCustomer.create(validExpatProps);
        
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const customer = result.value;
          const events = customer.domainEvents;
          
          expect(events.length).toBeGreaterThan(0);
          expect(events.some(e => e instanceof CustomerCreated)).toBe(true);
        }
      });
    });

    describe('business rules and invariants', () => {
      it('should enforce residenceDuration > 0', () => {
        const invalidProps = {
          ...validExpatProps,
          residenceDuration: 0 // Invalid: must be > 0
        };
        
        const result = ExpatCustomer.create(invalidProps);
        
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          expect(result.error).toContain('Residence duration must be greater than 0');
        }
      });

      it('should enforce subscription customers have delivery preferences', () => {
        const invalidSubscriptionProps = {
          ...validExpatProps,
          hasSubscription: true
          // Missing preferredDeliveryDay and preferredDeliveryFrequency
        };
        
        const result = ExpatCustomer.create(invalidSubscriptionProps);
        
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          expect(result.error).toContain('Delivery preferences must be set for subscription customers');
        }
      });

      it('should enforce required fields', () => {
        const incompleteProps = {
          name: 'John Doe',
          contactInfo: createValidContactInfo(),
          // Missing countryOfOrigin
          residencyStatus: 'PERMANENT' as const,
          residenceDuration: 24,
          hasSubscription: false
        };
        
        const result = ExpatCustomer.create(incompleteProps as any);
        
        expect(result.isFailure()).toBe(true);
      });
    });

    describe('state changes and behavior', () => {
      it('should update residency information', () => {
        const result = ExpatCustomer.create(validExpatProps);
        expect(result.isSuccess()).toBe(true);
        
        if (result.isSuccess()) {
          const customer = result.value;
          const updateResult = customer.updateResidencyInfo('TEMPORARY', 12);
          
          expect(updateResult.isSuccess()).toBe(true);
          expect(customer.residencyStatus).toBe('TEMPORARY');
          expect(customer.residenceDuration).toBe(12);
        }
      });

      it('should validate residency duration when updating', () => {
        const result = ExpatCustomer.create(validExpatProps);
        expect(result.isSuccess()).toBe(true);
        
        if (result.isSuccess()) {
          const customer = result.value;
          const updateResult = customer.updateResidencyInfo('TEMPORARY', 0); // Invalid duration
          
          expect(updateResult.isFailure()).toBe(true);
          if (updateResult.isFailure()) {
            expect(updateResult.error).toContain('Residence duration must be greater than 0');
          }
          expect(customer.residencyStatus).toBe('PERMANENT'); // Should not change
        }
      });

      it('should update dietary preferences', () => {
        const result = ExpatCustomer.create(validExpatProps);
        expect(result.isSuccess()).toBe(true);
        
        if (result.isSuccess()) {
          const customer = result.value;
          const newPreferences = ['Vegetarian', 'Low-Carb'];
          
          const updateResult = customer.updateDietaryPreferences(newPreferences);
          
          expect(updateResult.isSuccess()).toBe(true);
          expect(customer.dietaryPreferences).toEqual(newPreferences);
        }
      });

      it('should update subscription status', () => {
        const result = ExpatCustomer.create(validExpatProps);
        expect(result.isSuccess()).toBe(true);
        
        if (result.isSuccess()) {
          const customer = result.value;
          expect(customer.hasSubscription).toBe(false);
          
          const updateResult = customer.setSubscriptionStatus(true);
          
          expect(updateResult.isSuccess()).toBe(true);
          expect(customer.hasSubscription).toBe(true);
        }
      });

      it('should update delivery preferences', () => {
        const result = ExpatCustomer.create(subscriptionProps);
        expect(result.isSuccess()).toBe(true);
        
        if (result.isSuccess()) {
          const customer = result.value;
          expect(customer.preferredDeliveryDay).toBe('MONDAY');
          expect(customer.preferredDeliveryFrequency).toBe('WEEKLY');
          
          const updateResult = customer.updateDeliveryPreferences('FRIDAY', 'BI_WEEKLY');
          
          expect(updateResult.isSuccess()).toBe(true);
          expect(customer.preferredDeliveryDay).toBe('FRIDAY');
          expect(customer.preferredDeliveryFrequency).toBe('BI_WEEKLY');
        }
      });

      it('should allow partial update of delivery preferences', () => {
        const result = ExpatCustomer.create(subscriptionProps);
        expect(result.isSuccess()).toBe(true);
        
        if (result.isSuccess()) {
          const customer = result.value;
          expect(customer.preferredDeliveryDay).toBe('MONDAY');
          expect(customer.preferredDeliveryFrequency).toBe('WEEKLY');
          
          // Only update the frequency
          const updateResult = customer.updateDeliveryPreferences(undefined, 'MONTHLY');
          
          expect(updateResult.isSuccess()).toBe(true);
          expect(customer.preferredDeliveryDay).toBe('MONDAY'); // Should remain unchanged
          expect(customer.preferredDeliveryFrequency).toBe('MONTHLY'); // Should be updated
        }
      });
    });
  });
});
