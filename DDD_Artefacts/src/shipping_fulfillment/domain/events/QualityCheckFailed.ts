import { DomainEvent, DomainEventProps } from '../../../shared/domain/events/DomainEvent';

export interface QualityCheckFailedEventProps {
  productId: string;
  shipmentId: string;
  checkerId: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  quarantineRequired: boolean;
}

/**
 * Domain event raised when a product fails quality verification
 */
export class QualityCheckFailed extends DomainEvent {
  public readonly productId: string;
  public readonly shipmentId: string;
  public readonly checkerId: string;
  public readonly reason: string;
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly quarantineRequired: boolean;

  private constructor(props: DomainEventProps, eventProps: QualityCheckFailedEventProps) {
    super(props);
    this.productId = eventProps.productId;
    this.shipmentId = eventProps.shipmentId;
    this.checkerId = eventProps.checkerId;
    this.reason = eventProps.reason;
    this.severity = eventProps.severity;
    this.quarantineRequired = eventProps.quarantineRequired;
  }

  public static create(
    productId: string,
    shipmentId: string,
    checkerId: string,
    reason: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    quarantineRequired: boolean
  ): QualityCheckFailed {
    const props: DomainEventProps = {
      aggregateId: productId
    };
    
    const eventProps: QualityCheckFailedEventProps = {
      productId,
      shipmentId,
      checkerId,
      reason,
      severity,
      quarantineRequired
    };
    
    return new QualityCheckFailed(props, eventProps);
  }
  
  public toPrimitives(): any {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      aggregateId: this.aggregateId,
      productId: this.productId,
      shipmentId: this.shipmentId,
      checkerId: this.checkerId,
      reason: this.reason,
      severity: this.severity,
      quarantineRequired: this.quarantineRequired
    };
  }
  
  public static fromPrimitives(
    aggregateId: string,
    payload: any,
    occurredOn: Date
  ): QualityCheckFailed {
    const props: DomainEventProps = {
      aggregateId,
      occurredOn,
      eventId: payload.eventId
    };
    
    const eventProps: QualityCheckFailedEventProps = {
      productId: payload.productId,
      shipmentId: payload.shipmentId,
      checkerId: payload.checkerId,
      reason: payload.reason,
      severity: payload.severity,
      quarantineRequired: payload.quarantineRequired
    };
    
    return new QualityCheckFailed(props, eventProps);
  }
}
