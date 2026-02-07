import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),

  // Quantity is optional if sqft/rate are used
  qty: z.number().min(1, "Quantity must be at least 1").optional(),

  // Price is optional if sqft/rate are used
  price: z.number().min(1, "Price must be greater than 0").optional(),

  // For Wooden Boards / Finishes
  sqft: z.number().min(0.01, "Enter area in sqft").optional(),
  rate: z.number().min(1, "Rate per sqft must be greater than 0").optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
