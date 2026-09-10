import { z } from "zod";

export const generateKitInputSchema = z.object({
  jd: z.string().trim().min(1, "Job description is required"),

  company_url: z.string().trim().url("A valid company URL is required"),

  days: z.number().int().min(1).max(60),
});

export type GenerateKitInput = z.infer<typeof generateKitInputSchema>;
