import { ValueObject } from '../../../../shared/domain/base/ValueObject';
import { Result, success, failure } from '../../../../shared/core/Result';
import { Guard } from '../../../../shared/core/Guard';

interface TrackingNumberProps {
  value: string;
  carrier: string;
}

/**
 * TrackingNumber value object represents a carrier-specific tracking number
 * for shipment tracking
 */
export class TrackingNumber extends ValueObject<TrackingNumberProps> {
  private constructor(props: TrackingNumberProps) {
    super(props);
  }

  public static create(props: TrackingNumberProps): Result<TrackingNumber, string> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.value, argumentName: 'value' },
      { argument: props.carrier, argumentName: 'carrier' }
    ]);

    if (!guardResult.succeeded) {
      return failure(guardResult.message!);
    }

    if (props.value.trim().length === 0) {
      return failure('Tracking number cannot be empty');
    }

    if (props.carrier.trim().length === 0) {
      return failure('Carrier name cannot be empty');
    }

    // Carrier-specific validation could be added here
    // For example, UPS tracking numbers follow specific formats

    return success(new TrackingNumber({
      value: props.value.trim(),
      carrier: props.carrier.trim()
    }));
  }

  get value(): string {
    return this.props.value;
  }

  get carrier(): string {
    return this.props.carrier;
  }

  /**
   * Returns the tracking URL for the carrier's website
   */
  public getTrackingUrl(): string {
    // This is a simplified implementation
    // In a real system, this would have carrier-specific logic
    switch (this.props.carrier.toUpperCase()) {
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${this.props.value}`;
      case 'FEDEX':
        return `https://www.fedex.com/fedextrack/?trknbr=${this.props.value}`;
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${this.props.value}`;
      case 'DHL':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${this.props.value}`;
      default:
        return `https://www.google.com/search?q=${this.props.carrier}+tracking+${this.props.value}`;
    }
  }
}
