import { ApiCat, buildObservationPayload, mapApiCatToResident } from "@/data/residents";
import { ApiError, apiClient, unwrapApiResponse } from "@/lib/api";

export const catQueryKeys = {
  all: ["cats"] as const,
  detail: (id: string) => ["cats", id] as const,
};

type CreateCatInput = {
  name: string;
  gender: "Fêmea" | "Macho";
  status: "Disponível" | "Indisponível" | "Em Processo de Adoção" | "Adotado";
  coat: string;
  breed: string;
  weight: string;
  furTypeId: string;
  pictureBase64: string;
  adoptionTermBase64: string;
  adoptionTermMimeType: string;
  medicalExamBase64: string;
  medicalExamMimeType: string;
  entryDate: string;
  adoptionDate: string;
  birthDate: string;
  neutered: boolean;
  vaccinated: boolean;
  fiv: boolean;
  felv: boolean;
  notes: string;
};

type UpdateCatInput = CreateCatInput & {
  id: string;
};

type ApiClientResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
};

function mapStatusToApi(status: CreateCatInput["status"]): ApiCat["adoptionStatus"] {
  if (status === "Adotado") return "Adopted";
  if (status === "Em Processo de Adoção") return "Adoption Process";
  if (status === "Disponível") return "Available";
  return "Not Available";
}

function mapGenderToApi(gender: CreateCatInput["gender"]): ApiCat["gender"] {
  return gender === "Fêmea" ? "Female" : "Male";
}

function parseDateInput(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

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

function parseOptionalDateInput(value: string, label: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = parseDateInput(value);

  if (!parsed) {
    throw new Error(`${label} deve estar no formato dd / mm / yyyy.`);
  }

  return parsed;
}

export async function fetchResidents() {
  const response = await apiClient.cat.$get();
  const payload = await unwrapApiResponse<ApiCat[]>("/cat", response);
  return payload.data.map(mapApiCatToResident);
}

export async function fetchResident(id: string) {
  const response = await apiClient.cat[":id"].$get({
    param: { id },
  });
  const payload = await unwrapApiResponse<ApiCat>(`/cat/${id}`, response);
  return mapApiCatToResident(payload.data);
}

function buildCatEditableData(input: CreateCatInput) {
  const entryDate = parseDateInput(input.entryDate);

  if (!entryDate) {
    throw new Error("A data de entrada deve estar no formato dd / mm / yyyy.");
  }

  const adoptionDate = parseOptionalDateInput(input.adoptionDate, "A data de adocao");
  const birthDate = parseOptionalDateInput(input.birthDate, "A data de nascimento");

  return {
    name: input.name.trim(),
    adoptionStatus: mapStatusToApi(input.status),
    entryDate,
    adoptionDate,
    birthDate,
    race: input.breed.trim() || "Sem raça definida",
    gender: mapGenderToApi(input.gender),
    isCastrated: input.neutered,
    isVaccinated: input.vaccinated,
    weightKg: input.weight.trim() || null,
    furTypeId: input.furTypeId.trim() || null,
    pictureBase64: input.pictureBase64.trim() || null,
    adoptionTermBase64: input.adoptionTermBase64.trim() || null,
    adoptionTermMimeType: input.adoptionTermMimeType.trim() || null,
    medicalExamBase64: input.medicalExamBase64.trim() || null,
    medicalExamMimeType: input.medicalExamMimeType.trim() || null,
    isFiv: input.fiv,
    isFelv: input.felv,
    observation: buildObservationPayload(input.coat, input.notes),
  };
}

function buildCatMutationData(input: CreateCatInput) {
  return {
    ...buildCatEditableData(input),
  };
}

function buildCatUpdateData(input: CreateCatInput) {
  const { entryDate: _entryDate, ...data } = buildCatEditableData(input);

  return data;
}

export async function createCat(input: CreateCatInput) {
  const response = await apiClient.cat.$post({
    json: {
      data: buildCatMutationData(input),
    },
  });

  const payload = await unwrapApiResponse<ApiCat>("/cat", response);
  return payload.data;
}

export async function updateCat(input: UpdateCatInput) {
  const patchCat = apiClient.cat[":id"].$patch as unknown as (args: {
    param: { id: string };
    json: { data: ReturnType<typeof buildCatUpdateData> };
  }) => Promise<ApiClientResponse>;
  const response = await patchCat({
    param: { id: input.id },
    json: {
      data: buildCatUpdateData(input),
    },
  });

  const payload = await unwrapApiResponse<ApiCat>(`/cat/${input.id}`, response);
  return mapApiCatToResident(payload.data);
}

export async function deleteCat(id: string) {
  const response = await apiClient.cat[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: { message?: string } }).error?.message)
        : "Nao foi possivel excluir o residente.";

    throw new ApiError(message, response.status, `/cat/${id}`);
  }
}
