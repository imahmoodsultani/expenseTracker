import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
  projectId: z.string().nullable().optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
