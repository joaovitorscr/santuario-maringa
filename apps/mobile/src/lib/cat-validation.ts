import { z } from "zod";

const dateInputSchema = z
  .string()
  .trim()
  .regex(/^\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}$/, "Use o formato dd / mm / yyyy.");

const optionalDateInputSchema = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}$/.test(value),
    {
      message: "Use o formato dd / mm / yyyy.",
    },
  );

const optionalUuidInputSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      !value ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
    {
      message: "Informe um UUID valido.",
    },
  );

export const catFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do residente."),
  gender: z.enum(["Fêmea", "Macho"], {
    error: "Selecione o gênero do residente.",
  }),
  status: z.enum(
    ["Disponível", "Indisponível", "Em Processo de Adoção", "Adotado"],
    {
      error: "Selecione o status do residente.",
    },
  ),
  coat: z.string(),
  breed: z.string(),
  weight: z.string(),
  furTypeId: optionalUuidInputSchema,
  pictureBase64: z.string(),
  adoptionTermBase64: z.string(),
  adoptionTermMimeType: z.string(),
  medicalExamBase64: z.string(),
  medicalExamMimeType: z.string(),
  entryDate: dateInputSchema,
  adoptionDate: optionalDateInputSchema,
  birthDate: optionalDateInputSchema,
  neutered: z.boolean(),
  vaccinated: z.boolean(),
  fiv: z.boolean(),
  felv: z.boolean(),
  notes: z.string(),
});

export type CatFormValues = z.infer<typeof catFormSchema>;

export const catDefaultValues: CatFormValues = {
  name: "",
  gender: "Fêmea",
  status: "Disponível",
  coat: "",
  breed: "",
  weight: "",
  furTypeId: "",
  pictureBase64: "",
  adoptionTermBase64: "",
  adoptionTermMimeType: "",
  medicalExamBase64: "",
  medicalExamMimeType: "",
  entryDate: "21 / 04 / 2026",
  adoptionDate: "",
  birthDate: "",
  neutered: false,
  vaccinated: false,
  fiv: false,
  felv: false,
  notes: "",
};

export const genderOptions = [
  { label: "Fêmea", value: "Fêmea" },
  { label: "Macho", value: "Macho" },
] as const;

export const statusOptions = [
  { label: "Disponível", value: "Disponível" },
  { label: "Indisponível", value: "Indisponível" },
  { label: "Em Processo de Adoção", value: "Em Processo de Adoção" },
  { label: "Adotado", value: "Adotado" },
] as const;
