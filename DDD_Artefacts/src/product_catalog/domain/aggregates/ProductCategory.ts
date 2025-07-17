import { AggregateRoot } from '../../../shared/domain/base/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/base/UniqueEntityID';

interface ProductCategoryProps {
  name: string;
  description: string;
  parentCategoryId?: string;
  isActive: boolean;
}

export class ProductCategory extends AggregateRoot<ProductCategoryProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get parentCategoryId(): string | undefined {
    return this.props.parentCategoryId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  private constructor(props: ProductCategoryProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: ProductCategoryProps, id?: UniqueEntityID): ProductCategory {
    return new ProductCategory(props, id);
  }
}
