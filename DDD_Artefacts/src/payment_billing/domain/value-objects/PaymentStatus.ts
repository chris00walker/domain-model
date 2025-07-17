export enum PaymentStatus {
  Initiated = 'INITIATED',
  Captured = 'CAPTURED',
  Failed = 'FAILED',
  Refunded = 'REFUNDED',
  PartiallyRefunded = 'PARTIALLY_REFUNDED',
  Chargeback = 'CHARGEBACK'
}

export const isFinalStatus = (status: PaymentStatus): boolean => {
  return [
    PaymentStatus.Captured,
    PaymentStatus.Failed,
    PaymentStatus.Refunded,
    PaymentStatus.Chargeback
  ].includes(status);
};
