import { z } from "zod";

export const checkoutAddressSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().optional(),
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().optional(),
  country: z.string().trim().min(2),
  postalCode: z.string().trim().optional(),
  saveAddress: z.boolean().optional(),
});

export const checkoutItemsSchema = z.array(
  z.object({
    variantId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(99),
  }),
).min(1);

export const checkoutBodySchema = z.object({
  items: checkoutItemsSchema,
  shipping: checkoutAddressSchema,
  discountCode: z.string().optional(),
  gateway: z.enum(["paystack", "flutterwave"]).optional(),
});
