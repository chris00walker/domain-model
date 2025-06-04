import { UniqueEntityID } from '../base/UniqueEntityID';

export interface DomainEventProps {
  aggregateId: string;
  occurredOn?: Date;
  eventId?: string;
}

export abstract class DomainEvent {
  public readonly aggregateId: string;
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(props: DomainEventProps) {
    this.aggregateId = props.aggregateId;
    this.occurredOn = props.occurredOn || new Date();
    this.eventId = props.eventId || new UniqueEntityID().toString();
  }

  abstract toPrimitives(): any;

  static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): DomainEvent {
    throw new Error('Method not implemented');
  }
}
