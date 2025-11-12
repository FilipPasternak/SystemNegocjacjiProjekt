import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PRODUCER", "BUYER"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const offerSchema = z.object({
  product_name: z.string().min(1),
  product_category: z.string().min(1),
  sku: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive(),
  unit_of_measure: z.enum(["kg", "t", "pcs"]),
  unit_price: z.coerce.number().positive(),
  currency: z.enum(["PLN", "EUR", "USD"]),
  location: z.string().min(1),
  active: z.boolean().default(true),
});

export const orderSchema = z.object({
  offer_id: z.number(),
  quantity: z.coerce.number().int().positive(),
});
