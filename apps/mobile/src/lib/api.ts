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
  .get("/adoption_candidates", (c) =>
    c.json({} as ApiSuccessResponse<ApiAdoptionCandidate[]>),
  )
  .post("/adoption_candidates", async (c) => {
    await c.req.json<CreateAdoptionCandidatePayload>();
    return c.json({} as ApiSuccessResponse<ApiAdoptionCandidate>, 201);
  })
  .get("/adoption_candidates/:id", (c) =>
    c.json({} as ApiSuccessResponse<ApiAdoptionCandidate>),
  )
  .patch("/adoption_candidates/:id", async (c) => {
    await c.req.json<UpdateAdoptionCandidatePayload>();
    return c.json({} as ApiSuccessResponse<ApiAdoptionCandidate>);
  })
  .delete("/adoption_candidates/:id", (c) => {
    return c.body(null, 204);
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
  const details =
    error instanceof Error ? error.message : `Falha ao chamar ${path}`;

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
    return new ApiError(
      `${apiError.error.message} (${details})`,
      status,
      path,
      details,
    );
  }

  return new ApiError(
    `A API respondeu com erro. (HTTP ${status} em ${path})`,
    status,
    path,
  );
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
        : new URL(
            input instanceof URL ? input.toString() : input.url,
            apiBaseUrl,
          ).pathname;

    throw buildRequestError(path, error);
  }
};

export const apiClient = hc<typeof apiContract>(apiBaseUrl, {
  fetch: customFetch,
});

type ApiClientResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export async function unwrapApiResponse<TData>(
  path: string,
  response: ApiClientResponse,
): Promise<ApiSuccessResponse<TData>> {
  const payload = (await response.json()) as
    | ApiSuccessResponse<TData>
    | ApiErrorResponse;

  if (!response.ok) {
    throw buildResponseError(path, response.status, payload);
  }

  return payload as ApiSuccessResponse<TData>;
}
