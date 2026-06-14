import { ApiError, type ApiAdoptionCandidate, apiClient, unwrapApiResponse } from "@/lib/api";

export type { ApiAdoptionCandidate } from "@/lib/api";

export const adoptionCandidateQueryKeys = {
  all: ["adoption-candidates"] as const,
  detail: (id: string) => ["adoption-candidates", id] as const,
};

type CreateAdoptionCandidateInput = {
  name: string;
  cellphone: string;
  cpf: string;
  address: string;
  observation: string;
};

type UpdateAdoptionCandidateInput = CreateAdoptionCandidateInput & {
  id: string;
};

type ApiClientResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
};

function buildAdoptionCandidateData(input: CreateAdoptionCandidateInput) {
  return {
    name: input.name.trim(),
    cellphone: input.cellphone.trim(),
    cpf: input.cpf.trim() ? input.cpf.trim() : null,
    address: input.address.trim() || null,
    observation: input.observation.trim() || null,
  };
}

export async function fetchAdoptionCandidates() {
  const response = await apiClient.adoption_candidates.$get();
  const payload = await unwrapApiResponse<ApiAdoptionCandidate[]>("/adoption_candidates", response);
  return payload.data;
}

export async function fetchAdoptionCandidate(id: string) {
  const response = await apiClient.adoption_candidates[":id"].$get({
    param: { id },
  });
  const payload = await unwrapApiResponse<ApiAdoptionCandidate>(
    `/adoption_candidates/${id}`,
    response,
  );
  return payload.data;
}

export async function createAdoptionCandidate(input: CreateAdoptionCandidateInput) {
  const response = await apiClient.adoption_candidates.$post({
    json: {
      data: buildAdoptionCandidateData(input),
    },
  });

  const payload = await unwrapApiResponse<ApiAdoptionCandidate>("/adoption_candidates", response);
  return payload.data;
}

export async function updateAdoptionCandidate(input: UpdateAdoptionCandidateInput) {
  const patchCandidate = apiClient.adoption_candidates[":id"].$patch as unknown as (args: {
    param: { id: string };
    json: { data: ReturnType<typeof buildAdoptionCandidateData> };
  }) => Promise<ApiClientResponse>;
  const response = await patchCandidate({
    param: { id: input.id },
    json: {
      data: buildAdoptionCandidateData(input),
    },
  });

  const payload = await unwrapApiResponse<ApiAdoptionCandidate>(
    `/adoption_candidates/${input.id}`,
    response,
  );
  return payload.data;
}

export async function deleteAdoptionCandidate(id: string) {
  const response = await apiClient.adoption_candidates[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error?: { message?: string } }).error?.message)
        : "Nao foi possivel excluir o candidato.";

    throw new ApiError(message, response.status, `/adoption_candidates/${id}`);
  }
}
