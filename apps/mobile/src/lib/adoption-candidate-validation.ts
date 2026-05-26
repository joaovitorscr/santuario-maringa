import { z } from "zod";

const cellphoneDigitsLength = 11;
const cpfDigitsLength = 11;

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCellphone(value: string) {
  const digits = onlyDigits(value).slice(0, cellphoneDigitsLength);
  const areaCode = digits.slice(0, 2);
  const prefix = digits.slice(2, 7);
  const suffix = digits.slice(7, 11);

  if (digits.length <= 2) return areaCode;
  if (digits.length <= 7) return `(${areaCode}) ${prefix}`;
  return `(${areaCode}) ${prefix}-${suffix}`;
}

export function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, cpfDigitsLength);
  const first = digits.slice(0, 3);
  const second = digits.slice(3, 6);
  const third = digits.slice(6, 9);
  const check = digits.slice(9, 11);

  if (digits.length <= 3) return first;
  if (digits.length <= 6) return `${first}.${second}`;
  if (digits.length <= 9) return `${first}.${second}.${third}`;
  return `${first}.${second}.${third}-${check}`;
}

function hasValidCpfCheckDigits(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== cpfDigitsLength || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  const numbers = digits.split("").map(Number);
  const firstCheckDigit = numbers[9];
  const secondCheckDigit = numbers[10];

  const calculateDigit = (sliceEnd: number) => {
    const sum = numbers
      .slice(0, sliceEnd)
      .reduce((total, digit, index) => total + digit * (sliceEnd + 1 - index), 0);
    const remainder = (sum * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === firstCheckDigit && calculateDigit(10) === secondCheckDigit;
}

export const adoptionCandidateFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do candidato.").max(255, "Use até 255 caracteres."),
  cellphone: z
    .string()
    .trim()
    .refine((value) => onlyDigits(value).length === cellphoneDigitsLength, {
      message: "Informe um celular com DDD no formato (00) 00000-0000.",
    }),
  cpf: z
    .string()
    .trim()
    .refine((value) => !value || onlyDigits(value).length === cpfDigitsLength, {
      message: "Informe o CPF no formato 000.000.000-00.",
    })
    .refine((value) => !value || hasValidCpfCheckDigits(value), {
      message: "Informe um CPF válido.",
    }),
  address: z.string().trim().max(255, "Use até 255 caracteres.").optional(),
  observation: z.string().trim().max(500, "Use até 500 caracteres.").optional(),
});

export type AdoptionCandidateFormValues = z.infer<typeof adoptionCandidateFormSchema>;
