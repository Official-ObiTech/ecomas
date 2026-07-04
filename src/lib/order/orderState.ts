import { OrderStatus } from "@/generated/prisma";


// which statuses each status is allowed to move to
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [], // terminal
  REFUNDED: [], // terminal
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}