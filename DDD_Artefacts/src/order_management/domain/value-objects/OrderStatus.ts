export enum OrderStatus {
  Created = 'CREATED',
  Paid = 'PAID',
  Processing = 'PROCESSING',
  Fulfilled = 'FULFILLED',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
  Refunded = 'REFUNDED'
}

export const isTerminalStatus = (status: OrderStatus): boolean => {
  return [
    OrderStatus.Delivered,
    OrderStatus.Cancelled,
    OrderStatus.Refunded
  ].includes(status);
};

export const getNextStatus = (current: OrderStatus): OrderStatus | null => {
  const statusFlow: Record<OrderStatus, OrderStatus | null> = {
    [OrderStatus.Created]: OrderStatus.Paid,
    [OrderStatus.Paid]: OrderStatus.Processing,
    [OrderStatus.Processing]: OrderStatus.Fulfilled,
    [OrderStatus.Fulfilled]: OrderStatus.Shipped,
    [OrderStatus.Shipped]: OrderStatus.Delivered,
    [OrderStatus.Delivered]: null,
    [OrderStatus.Cancelled]: null,
    [OrderStatus.Refunded]: null
  };

  return statusFlow[current] || null;
};
