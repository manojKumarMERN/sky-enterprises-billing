import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  qty: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(1, "Price must be greater than 0"),
});

export type ProductInput = z.infer<typeof productSchema>;
