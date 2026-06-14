import { z } from "zod";

const dateInputSchema = z
  .string()
  .trim()
  .regex(/^\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}$/, "Use o formato dd / mm / yyyy.");

const uuidInputSchema = z.string().trim().uuid("Selecione uma opção.");

export const adoptionFormSchema = z.object({
  adoptionCandidateId: uuidInputSchema,
  catId: uuidInputSchema,
  adoptionDate: dateInputSchema,
  observation: z.string(),
});

export type AdoptionFormValues = z.infer<typeof adoptionFormSchema>;
