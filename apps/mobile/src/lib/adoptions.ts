import { type ApiAdoption, apiClient, unwrapApiResponse } from "@/lib/api";

export type { ApiAdoption } from "@/lib/api";

export const adoptionQueryKeys = {
  all: ["adoptions"] as const,
};

type CreateAdoptionInput = {
  adoptionCandidateId: string;
  catId: string;
  adoptionDate: string;
  observation: string;
};

function parseDateInput(value: string) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const iso = new Date(`${year}-${month}-${day}T12:00:00.000Z`);

  if (Number.isNaN(iso.getTime())) {
    return null;
  }

  const validDate =
    iso.getUTCFullYear() === Number(year) &&
    iso.getUTCMonth() + 1 === Number(month) &&
    iso.getUTCDate() === Number(day);

  return validDate ? iso.toISOString() : null;
}

function buildAdoptionData(input: CreateAdoptionInput) {
  const adoptionDate = parseDateInput(input.adoptionDate);

  if (!adoptionDate) {
    throw new Error("A data de adoção deve estar no formato dd / mm / yyyy.");
  }

  return {
    adoptionCandidateId: input.adoptionCandidateId,
    catId: input.catId,
    adoptionDate,
    observation: input.observation.trim() || null,
  };
}

export async function fetchAdoptions() {
  const response = await apiClient.adoptions.$get();
  const payload = await unwrapApiResponse<ApiAdoption[]>("/adoptions", response);
  return payload.data;
}

export async function createAdoption(input: CreateAdoptionInput) {
  const response = await apiClient.adoptions.$post({
    json: {
      data: buildAdoptionData(input),
    },
  });

  const payload = await unwrapApiResponse<ApiAdoption>("/adoptions", response);
  return payload.data;
}
