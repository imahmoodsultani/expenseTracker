import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").trim(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
