import { UniqueEntityID } from './UniqueEntityID';
import { DomainEvent } from '../events/DomainEvent';

/**
 * Entity Base Class
 * 
 * Represents domain entities which are defined by their identity rather than their attributes.
 * Entities have a unique identity that persists throughout the system's lifetime.
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  protected readonly props: T;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id ? id : new UniqueEntityID();
    this.props = props;
  }

  /**
   * The entity's unique identifier
   */
  public get id(): UniqueEntityID {
    return this._id;
  }

  /**
   * Domain events raised by this entity
   */
  public get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  /**
   * Add a domain event to this entity
   */
  public addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  /**
   * Clear all domain events from this entity
   */
  public clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Equality is determined by ID
   */
  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    if (!(entity instanceof Entity)) {
      return false;
    }

    return this._id.equals(entity._id);
  }
}
