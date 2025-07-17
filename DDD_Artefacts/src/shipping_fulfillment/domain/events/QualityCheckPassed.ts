import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';

export interface QualityCheckPassedEventProps {
  productId: string;
  shipmentId: string;
  checkerId: string;
  notes?: string;
}

/**
 * Domain event raised when a product passes quality verification
 */
export class QualityCheckPassed extends DomainEvent {
  public readonly productId: string;
  public readonly shipmentId: string;
  public readonly checkerId: string;
  public readonly notes?: string;

  private constructor(props: DomainEventProps, eventProps: QualityCheckPassedEventProps) {
    super(props);
    this.productId = eventProps.productId;
    this.shipmentId = eventProps.shipmentId;
    this.checkerId = eventProps.checkerId;
    this.notes = eventProps.notes;
  }

  public static create(
    productId: string,
    shipmentId: string,
    checkerId: string,
    notes?: string
  ): QualityCheckPassed {
    const props: DomainEventProps = {
      aggregateId: productId
    };
    
    const eventProps: QualityCheckPassedEventProps = {
      productId,
      shipmentId,
      checkerId,
      notes
    };
    
    return new QualityCheckPassed(props, eventProps);
  }
  
  public toPrimitives(): any {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      aggregateId: this.aggregateId,
      productId: this.productId,
      shipmentId: this.shipmentId,
      checkerId: this.checkerId,
      notes: this.notes
    };
  }
  
  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): QualityCheckPassed {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn,
      eventId: payload.eventId
    };
    
    const eventProps: QualityCheckPassedEventProps = {
      productId: payload.productId,
      shipmentId: payload.shipmentId,
      checkerId: payload.checkerId,
      notes: payload.notes
    };
    
    return new QualityCheckPassed(props, eventProps);
  }
}
