import { z } from "zod/v4";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  sale_price: z.number().positive().optional(),
  images: z.array(z.string().url()),
  category_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const CartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  items: z.array(CartItemSchema),
  total: z.number().positive(),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
  shipping_address: z.string().min(1),
  phone: z.string().min(1),
  created_at: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;
