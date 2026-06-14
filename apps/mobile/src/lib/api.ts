import type { ApiCat } from "@/data/residents";
import { hc } from "hono/client";
import { Hono } from "hono";

import { authClient } from "@/lib/auth-client";
import { apiBaseUrl } from "@/lib/api-config";

type ApiResponseMeta = {
  timestamp: string;
  requestId?: string;
};

type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  meta: ApiResponseMeta;
};

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  meta: ApiResponseMeta;
};

type CreateCatPayload = {
  data: {
    name: string;
    pictureBase64: string | null;
    adoptionTermBase64: string | null;
    adoptionTermMimeType: string | null;
    medicalExamBase64: string | null;
    medicalExamMimeType: string | null;
    furTypeId: string | null;
    adoptionStatus: ApiCat["adoptionStatus"];
    entryDate: string;
    adoptionDate: string | null;
    birthDate: string | null;
    race: string;
    gender: ApiCat["gender"];
    isCastrated: boolean;
    isVaccinated: boolean;
    weightKg: string | null;
    isFiv: boolean;
    isFelv: boolean;
    observation: string | null;
  };
};

type UpdateCatPayload = {
  data: Partial<CreateCatPayload["data"]>;
};

export type ApiAdoptionCandidate = {
  id: string;
  name: string;
  cellphone: string;
  cpf: string | null;
  address: string | null;
  observation: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiAdoption = {
  id: string;
  adoptionCandidateId: string;
  catId: string;
  adoptionDate: string;
  observation: string | null;
  createdAt: string;
  updatedAt: string;
  adoptionCandidate: {
    id: string;
    name: string;
    cellphone: string;
    cpf: string | null;
  };
  cat: {
    id: string;
    name: string;
    pictureBase64: string | null;
    adoptionStatus: ApiCat["adoptionStatus"];
    adoptionDate: string | null;
  };
};

type CreateAdoptionCandidatePayload = {
  data: {
    name: string;
    cellphone: string;
    cpf?: string | null;
    address?: string | null;
    observation?: string | null;
  };
};

type UpdateAdoptionCandidatePayload = {
  data: Partial<CreateAdoptionCandidatePayload["data"]>;
};

type CreateAdoptionPayload = {
  data: {
    adoptionCandidateId: string;
    catId: string;
    adoptionDate: string;
    observation?: string | null;
  };
};

export const apiContract = new Hono()
  .get("/cat", (c) => c.json({} as ApiSuccessResponse<ApiCat[]>))
  .get("/cat/:id", (c) => c.json({} as ApiSuccessResponse<ApiCat>))
  .post("/cat", async (c) => {
    await c.req.json<CreateCatPayload>();
    return c.json({} as ApiSuccessResponse<ApiCat>, 201);
  })
  .patch("/cat/:id", async (c) => {
    await c.req.json<UpdateCatPayload>();
    return c.json({} as ApiSuccessResponse<ApiCat>);
  })
  .delete("/cat/:id", (c) => c.body(null, 204))
  .get("/adoption_candidates", (c) => c.json({} as ApiSuccessResponse<ApiAdoptionCandidate[]>))
  .post("/adoption_candidates", async (c) => {
    await c.req.json<CreateAdoptionCandidatePayload>();
    return c.json({} as ApiSuccessResponse<ApiAdoptionCandidate>, 201);
  })
  .get("/adoption_candidates/:id", (c) => c.json({} as ApiSuccessResponse<ApiAdoptionCandidate>))
  .patch("/adoption_candidates/:id", async (c) => {
    await c.req.json<UpdateAdoptionCandidatePayload>();
    return c.json({} as ApiSuccessResponse<ApiAdoptionCandidate>);
  })
  .delete("/adoption_candidates/:id", (c) => {
    return c.body(null, 204);
  })
  .get("/adoptions", (c) => c.json({} as ApiSuccessResponse<ApiAdoption[]>))
  .post("/adoptions", async (c) => {
    await c.req.json<CreateAdoptionPayload>();
    return c.json({} as ApiSuccessResponse<ApiAdoption>, 201);
  });

export class ApiError extends Error {
  status: number;
  path: string;
  details?: string;

  constructor(message: string, status: number, path: string, details?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.details = details;
  }
}

function buildRequestError(path: string, error: unknown) {
  const details = error instanceof Error ? error.message : `Falha ao chamar ${path}`;

  return new ApiError(
    `Nao foi possivel conectar com a API. Verifique se ${apiBaseUrl} esta acessivel pelo dispositivo. (${details})`,
    0,
    path,
    details,
  );
}

function buildResponseError(path: string, status: number, payload: unknown) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const apiError = payload as ApiErrorResponse;
    const details = `HTTP ${status} em ${path}`;
    return new ApiError(`${apiError.error.message} (${details})`, status, path, details);
  }

  if (status === 404 && typeof payload === "string") {
    const details = `HTTP ${status} em ${path}`;
    return new ApiError(
      `A rota ${path} não está disponível na API configurada (${apiBaseUrl}). Atualize a API ou aponte o app para a API local. (${details})`,
      status,
      path,
      details,
    );
  }

  if (typeof payload === "string" && payload.trim()) {
    const details = `HTTP ${status} em ${path}`;
    return new ApiError(`${payload.trim()} (${details})`, status, path, details);
  }

  return new ApiError(`A API respondeu com erro. (HTTP ${status} em ${path})`, status, path);
}

const customFetch: typeof fetch = async (input, init) => {
  const headers = new Headers(init?.headers);
  const cookie = authClient.getCookie?.();

  if (cookie) {
    headers.set("cookie", cookie);
  }

  try {
    return await fetch(input, {
      ...init,
      credentials: "omit",
      headers,
    });
  } catch (error) {
    const path =
      typeof input === "string"
        ? new URL(input, apiBaseUrl).pathname
        : new URL(input instanceof URL ? input.toString() : input.url, apiBaseUrl).pathname;

    throw buildRequestError(path, error);
  }
};

export const apiClient = hc<typeof apiContract>(apiBaseUrl, {
  fetch: customFetch,
});

type ApiClientResponse = {
  ok: boolean;
  status: number;
  headers?: {
    get: (name: string) => string | null;
  };
  text: () => Promise<string>;
};

function parseResponsePayload(path: string, responseText: string) {
  if (!responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch (error) {
    const contentType = responseText.trim().slice(0, 80);

    if (responseText.trim().toLowerCase() === "not found") {
      return responseText;
    }

    throw new ApiError(
      `A API respondeu com um corpo inválido para ${path}. (${contentType})`,
      0,
      path,
      error instanceof Error ? error.message : undefined,
    );
  }
}

export async function unwrapApiResponse<TData>(
  path: string,
  response: ApiClientResponse,
): Promise<ApiSuccessResponse<TData>> {
  const responseText = await response.text();
  const payload = parseResponsePayload(path, responseText) as
    | ApiSuccessResponse<TData>
    | ApiErrorResponse
    | string
    | null;

  if (!response.ok) {
    throw buildResponseError(path, response.status, payload);
  }

  if (!payload || typeof payload === "string") {
    throw new ApiError(`A API respondeu sem dados válidos para ${path}.`, response.status, path);
  }

  return payload as ApiSuccessResponse<TData>;
}
