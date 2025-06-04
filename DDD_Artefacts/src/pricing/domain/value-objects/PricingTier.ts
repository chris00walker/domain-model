import { ValueObject } from '@shared/domain/base/ValueObject';
import { Result, success, failure } from '@shared/core/Result';
import { Guard } from '@shared/core/Guard';

export enum PricingTierType {
  GUEST = 'GUEST',          // Unregistered customers
  RETAIL = 'RETAIL',        // Registered individual consumers (B2C)
  COMMERCIAL = 'COMMERCIAL', // Food trucks, small restaurants
  WHOLESALE = 'WHOLESALE',   // Mini-markets, larger establishments
  IMPORTER = 'IMPORTER'     // Regional importers at FOB prices
}

interface PricingTierProps {
  type: PricingTierType;
  name: string;
}

export class PricingTier extends ValueObject<PricingTierProps> {
  get type(): PricingTierType {
    return this.props.type;
  }
  
  get name(): string {
    return this.props.name;
  }

  private constructor(props: PricingTierProps) {
    super(props);
  }

  public static create(type: PricingTierType): Result<PricingTier, string> {
    const guardResult = Guard.againstNullOrUndefined(type, 'pricingTierType');
    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    // Verify the type is a valid PricingTierType
    if (!Object.values(PricingTierType).includes(type)) {
      return failure(`Invalid pricing tier type: ${type}`);
    }
    
    // Generate a display name for the tier
    const name = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    
    return success(new PricingTier({ type, name }));
  }

  public isGuest(): boolean {
    return this.props.type === PricingTierType.GUEST;
  }

  public isRetail(): boolean {
    return this.props.type === PricingTierType.RETAIL;
  }

  public isCommercial(): boolean {
    return this.props.type === PricingTierType.COMMERCIAL;
  }

  public isWholesale(): boolean {
    return this.props.type === PricingTierType.WHOLESALE;
  }

  public isImporter(): boolean {
    return this.props.type === PricingTierType.IMPORTER;
  }

  public getBaseMarkupPercentage(): number {
    switch (this.props.type) {
      case PricingTierType.GUEST:
      case PricingTierType.RETAIL:
        return 150;
      case PricingTierType.COMMERCIAL:
        return 125;
      case PricingTierType.WHOLESALE:
        return 100;
      case PricingTierType.IMPORTER:
        return 60;
      default:
        throw new Error(`Unknown pricing tier type: ${this.props.type}`);
    }
  }

  public getMaxDiscountPercentage(): number {
    switch (this.props.type) {
      case PricingTierType.GUEST:
        return 15;
      case PricingTierType.RETAIL:
        return 20;
      case PricingTierType.COMMERCIAL:
        return 25;
      case PricingTierType.WHOLESALE:
        return 30;
      case PricingTierType.IMPORTER:
        return 15;
      default:
        throw new Error(`Unknown pricing tier type: ${this.props.type}`);
    }
  }

  public getFloorGrossMarginPercentage(): number {
    switch (this.props.type) {
      case PricingTierType.GUEST:
        return 135;
      case PricingTierType.RETAIL:
        return 130;
      case PricingTierType.COMMERCIAL:
        return 100;
      case PricingTierType.WHOLESALE:
        return 70;
      case PricingTierType.IMPORTER:
        return 30;
      default:
        throw new Error(`Unknown pricing tier type: ${this.props.type}`);
    }
  }

  public getTargetGrossMarginPercentage(): number {
    switch (this.props.type) {
      case PricingTierType.GUEST:
      case PricingTierType.RETAIL:
        return 140;
      case PricingTierType.COMMERCIAL:
        return 110;
      case PricingTierType.WHOLESALE:
        return 80;
      case PricingTierType.IMPORTER:
        return 40;
      default:
        throw new Error(`Unknown pricing tier type: ${this.props.type}`);
    }
  }

  public toString(): string {
    return this.props.type;
  }

  public equals(vo?: ValueObject<any>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (!(vo instanceof PricingTier)) {
      return false;
    }
    return this.props.type === vo.props.type;
  }
}
