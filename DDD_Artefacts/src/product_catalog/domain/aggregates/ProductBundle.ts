import { AggregateRoot } from '../../../shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/base/UniqueEntityID';

interface ProductBundleProps {
  name: string;
  description: string;
  productIds: string[];
  isActive: boolean;
}

export class ProductBundle extends AggregateRoot<ProductBundleProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get productIds(): string[] {
    return this.props.productIds;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  private constructor(props: ProductBundleProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: ProductBundleProps, id?: UniqueEntityID): ProductBundle {
    return new ProductBundle(props, id);
  }
}
