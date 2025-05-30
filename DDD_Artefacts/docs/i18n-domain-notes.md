# Multilingual Domain Considerations

## Overview

This document outlines how the Elias Food Imports (EFI) domain model should handle multilingual requirements, particularly focusing on the business requirement for English/Arabic (EN/AR) bilingual support specified in the constraints document.

## Domain Model Impact

### 1. Localized Value Objects

We need to introduce new value objects that support localization:

#### 1.1 LocalizedText

A value object to represent text that needs multilingual support:

```typescript
interface LocalizedTextProps {
  translations: Record<string, string>;
  defaultLocale: string;
}

class LocalizedText extends ValueObject<LocalizedTextProps> {
  constructor(props: LocalizedTextProps) {
    super(props);
  }
  
  getText(locale?: string): string {
    const requestedLocale = locale || this.props.defaultLocale;
    
    // Return requested locale if available
    if (this.props.translations[requestedLocale]) {
      return this.props.translations[requestedLocale];
    }
    
    // Fall back to default locale
    return this.props.translations[this.props.defaultLocale] || '';
  }
  
  static create(translations: Record<string, string>, defaultLocale: string): Result<LocalizedText, string> {
    if (!translations[defaultLocale]) {
      return failure(`Missing translation for default locale: ${defaultLocale}`);
    }
    
    return success(new LocalizedText({ translations, defaultLocale }));
  }
}
```

#### 1.2 LocalizedCurrency

Extension of the Money value object to include localized formatting:

```typescript
interface LocalizedCurrencyProps extends MoneyProps {
  localeFormats: Record<string, string>;
}

class LocalizedCurrency extends Money {
  private localeFormats: Record<string, string>;
  
  format(locale: string): string {
    if (this.localeFormats[locale]) {
      // Custom formatting per locale
      return this.localeFormats[locale].replace('{amount}', this.amount.toString());
    }
    
    // Default formatting
    return super.toString();
  }
}
```

### 2. Entity Modifications

#### 2.1 Product Aggregate

The Product aggregate needs to be modified to support localized fields:

```typescript
interface MultilinguaProductProps extends ProductProps {
  localizedName: LocalizedText;
  localizedDescription: LocalizedText;
  localizedAttributes: Record<string, LocalizedText>;
}
```

Updated implementation:

```typescript
class Product extends AggregateRoot<MultilinguaProductProps> {
  // Existing methods...
  
  getName(locale?: string): string {
    return this.props.localizedName.getText(locale);
  }
  
  getDescription(locale?: string): string {
    return this.props.localizedDescription.getText(locale);
  }
  
  getAttribute(key: string, locale?: string): string | null {
    const attribute = this.props.localizedAttributes[key];
    return attribute ? attribute.getText(locale) : null;
  }
}
```

#### 2.2 Category Entity

Categories should also support localization:

```typescript
interface MultilinguaCategoryProps {
  localizedName: LocalizedText;
  localizedDescription: LocalizedText;
  // Other properties...
}
```

### 3. Domain Services

#### 3.1 Localization Service

A domain service to manage localization concerns:

```typescript
interface LocalizationService {
  getUserLocale(): string;
  getAvailableLocales(): string[];
  getDefaultLocale(): string;
  translateErrorMessage(error: string, locale: string): string;
}
```

#### 3.2 Localized Catalog Service

A specialized service for the catalog domain:

```typescript
class LocalizedCatalogService {
  constructor(
    private productRepository: ProductRepository,
    private localizationService: LocalizationService
  ) {}
  
  async getLocalizedProduct(productId: string, locale?: string): Promise<LocalizedProductDTO> {
    const userLocale = locale || this.localizationService.getUserLocale();
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return {
      id: product.id,
      name: product.getName(userLocale),
      description: product.getDescription(userLocale),
      price: product.price.format(userLocale),
      // Other properties...
    };
  }
}
```

## Implementation Strategy

### 1. Database Considerations

Two approaches for storing multilingual content:

#### Option A: Embedded Document Approach

Store all translations within the entity document:

```json
{
  "productId": "123",
  "localizedName": {
    "en": "Lebanese Tahini",
    "ar": "طحينة لبنانية"
  },
  "localizedDescription": {
    "en": "Premium tahini made from 100% sesame seeds",
    "ar": "طحينة ممتازة مصنوعة من 100٪ بذور السمسم"
  }
}
```

**Pros**: 
- Simple retrieval of all translations at once
- No joins required

**Cons**:
- Document size grows with number of languages
- Partial updates more complex

#### Option B: Separate Collection Approach

Store translations in a separate collection:

```json
// products collection
{
  "productId": "123",
  "defaultName": "Lebanese Tahini",
  "defaultDescription": "Premium tahini made from 100% sesame seeds"
}

// translations collection
{
  "entityType": "product",
  "entityId": "123",
  "field": "name",
  "locale": "ar",
  "value": "طحينة لبنانية"
}
```

**Pros**:
- Efficient when retrieving a single language
- Easy to add new languages

**Cons**:
- Requires joins for full entity retrieval
- More complex queries

**Recommendation**: Use the embedded document approach (Option A) since EFI only requires support for two languages (EN/AR).

### 2. User Experience Considerations

- Store user language preference in their profile
- Provide language toggle in the UI
- Consider right-to-left (RTL) layout for Arabic content
- Ensure date/time formats respect locale conventions

### 3. Search Considerations

- Implement language-specific search indexes
- Support Arabic text search features (diacritics, stemming)
- Consider cross-language search capabilities

## Implementation Phases

### Phase 1: Core Infrastructure

1. Implement `LocalizedText` value object
2. Create localization service
3. Update Product aggregate to support localized fields

### Phase 2: UI Integration

1. Add language selection to user preferences
2. Implement RTL layout support
3. Create localized DTOs for API responses

### Phase 3: Advanced Features

1. Implement language-specific search
2. Add support for currency localization
3. Implement localized error messages

## Impact on Existing Code

1. **Entities and Aggregates**:
   - Add localized fields to Product, Category, and relevant entities
   - Update factory methods to handle localized content

2. **Repositories**:
   - Add language filter parameters to query methods
   - Update repository implementations to handle localized fields

3. **API Layer**:
   - Add locale parameter to endpoints
   - Transform domain objects to localized DTOs

## Conclusion

Supporting multilingual content in the domain model requires careful design but is essential for meeting EFI's business requirements. By introducing specialized value objects and services, we can encapsulate the localization logic while maintaining the integrity of our domain model.

_Last Updated: 2025-05-30_
