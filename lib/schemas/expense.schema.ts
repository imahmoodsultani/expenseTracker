import { z } from "zod";

// Base object schema — used for partial updates (ZodObject supports .partial(), ZodEffects does not)
export const expenseBaseSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num !== 0;
    }, "Amount cannot be zero"),
  date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().trim().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]).optional().nullable(),
});

// Full schema with cross-field validation — used for creates
export const expenseSchema = expenseBaseSchema.refine(
  (data) => {
    if (data.isRecurring && !data.recurrenceFrequency) {
      return false;
    }
    return true;
  },
  {
    message: "Recurrence frequency is required when recurring is enabled",
    path: ["recurrenceFrequency"],
  }
);

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
