import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name required"),
  address: z.string().min(1, "Address required"),
  phone: z.string().min(10, "Phone must be 10 digits"),
});
