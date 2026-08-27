// Re-export all types from database schema
export type {
  Database,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
  Profile,
  Address,
  Category,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  OrderHistoryEntry,
  Payment,
  CartItem,
} from "./database";

export {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_COLORS,
} from "./database";
