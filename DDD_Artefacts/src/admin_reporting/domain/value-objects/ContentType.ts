import { Result, success, failure } from '../../../shared/core/Result';

/**
 * Represents valid content types that can be moderated
 */
export type ContentTypeValue = 
  | 'PRODUCT_DESCRIPTION'
  | 'CUSTOMER_REVIEW'
  | 'USER_PROFILE'
  | 'BLOG_POST'
  | 'MARKETING_CONTENT'
  | 'SUPPLIER_INFORMATION'
  | 'SUPPORT_TICKET';

/**
 * ContentType Value Object
 * 
 * Represents the type of content being submitted for moderation
 */
export class ContentType {
  private constructor(public readonly value: ContentTypeValue) {}
  
  public static readonly VALID_TYPES: ContentTypeValue[] = [
    'PRODUCT_DESCRIPTION',
    'CUSTOMER_REVIEW',
    'USER_PROFILE',
    'BLOG_POST',
    'MARKETING_CONTENT',
    'SUPPLIER_INFORMATION',
    'SUPPORT_TICKET'
  ];
  
  public static isValidType(type: string): boolean {
    return ContentType.VALID_TYPES.includes(type as ContentTypeValue);
  }
  
  /**
   * Creates a new ContentType value object
   */
  public static create(type: string): Result<ContentType, Error> {
    if (!ContentType.isValidType(type)) {
      return failure(new Error(`"${type}" is not a valid content type. Valid types are: ${ContentType.VALID_TYPES.join(', ')}`));
    }
    
    return success<ContentType>(new ContentType(type as ContentTypeValue));
  }
  
  public equals(other: ContentType): boolean {
    return this.value === other.value;
  }
  
  public toString(): string {
    return this.value;
  }
}
