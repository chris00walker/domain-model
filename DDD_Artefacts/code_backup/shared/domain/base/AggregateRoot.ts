import { DomainEvent } from '../events/DomainEvent';
import { UniqueEntityID } from './UniqueEntityID';
import { DomainEvents } from '../events/DomainEvents';

export abstract class AggregateRoot<T> {
  private _domainEvents: DomainEvent[] = [];
  protected readonly _id: UniqueEntityID;
  protected props: T;

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id || new UniqueEntityID();
    this.props = props;
  }

  /**
   * Gets the string representation of the aggregate's ID
   */
  get id(): string {
    return this._id.toString();
  }
  
  /**
   * Gets the UniqueEntityID of the aggregate
   * Used by the DomainEvents manager
   */
  public getId(): UniqueEntityID {
    return this._id;
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Adds a domain event to this aggregate and marks it for dispatch
   * @param domainEvent - The domain event to add
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    // Add event to the aggregate's local collection
    this._domainEvents.push(domainEvent);
    
    // Mark the aggregate for event dispatch
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public equals(object?: AggregateRoot<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof AggregateRoot)) {
      return false;
    }

    return this._id.equals(object._id);
  }
}
