import { DomainEvent } from './events/DomainEvent';
import { UniqueEntityID } from './UniqueEntityID';

export abstract class AggregateRoot<T> {
  private _domainEvents: DomainEvent[] = [];
  protected readonly _id: UniqueEntityID;
  protected props: T;

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id || new UniqueEntityID();
    this.props = props;
  }

  get id(): string {
    return this._id.toString();
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
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
