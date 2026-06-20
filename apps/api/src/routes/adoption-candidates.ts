import { db } from "@/db";
import { adoptionCandidate } from "@/db/schema/adoption-candidate";
import {
  InternalServerErrorResponseSchema,
  NotFoundErrorResponseSchema,
  UnauthorizedErrorResponseSchema,
  ValidationErrorResponseSchema,
  buildApiErrorResponse,
  buildApiResponse,
  createApiRequestSchema,
  createApiResponseSchema,
  jsonResponse,
} from "@/contracts/base";
import { hasPermission } from "@/lib/app-permissions";
import { desc, eq } from "drizzle-orm";
import { createSchemaFactory } from "drizzle-zod";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

type AdoptionCandidateEnv = {
  Variables: {
    user: { role?: string | null } | null;
  };
};

const app = new OpenAPIHono<AdoptionCandidateEnv>();
const { createInsertSchema } = createSchemaFactory({ zodInstance: z });

const IsoDateTimeSchema = z.iso.datetime();
const CellphoneSchema = z
  .string()
  .trim()
  .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Cellphone must be in the format (00) 00000-0000");
const CpfSchema = z
  .string()
  .trim()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF must be in the format 000.000.000-00")
  .refine((value) => hasValidCpfCheckDigits(value), "CPF is invalid");

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function hasValidCpfCheckDigits(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
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

const AdoptionCandidateIdParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi("AdoptionCandidateIdParams");

const AdoptionCandidateSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    cellphone: z.string(),
    cpf: z.string().nullable(),
    address: z.string().nullable(),
    observation: z.string().nullable(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  })
  .openapi("AdoptionCandidate");

const AdoptionCandidateListResponseSchema = createApiResponseSchema(
  z.array(AdoptionCandidateSchema),
  "AdoptionCandidateListResponse",
);

const AdoptionCandidateResponseSchema = createApiResponseSchema(
  AdoptionCandidateSchema,
  "AdoptionCandidateResponse",
);

const AdoptionCandidateMutationBodySchema = createInsertSchema(adoptionCandidate, {
  name: (schema) => schema.trim().min(1).max(255),
  cellphone: CellphoneSchema,
  cpf: CpfSchema.nullable().optional(),
  address: (schema) => schema.trim().max(255).nullable().optional(),
  observation: (schema) => schema.trim().max(500).nullable().optional(),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi("AdoptionCandidateMutationBody");

const CreateAdoptionCandidateRequestSchema = createApiRequestSchema(
  AdoptionCandidateMutationBodySchema,
  "CreateAdoptionCandidateRequest",
);

const UpdateAdoptionCandidateRequestSchema = createApiRequestSchema(
  AdoptionCandidateMutationBodySchema.partial(),
  "UpdateAdoptionCandidateRequest",
);

const listAdoptionCandidatesRoute = createRoute({
  method: "get",
  path: "/adoption_candidates",
  tags: ["AdoptionCandidate"],
  summary: "List adoption candidates",
  responses: {
    200: jsonResponse(AdoptionCandidateListResponseSchema, "Adoption candidate list"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const getAdoptionCandidateRoute = createRoute({
  method: "get",
  path: "/adoption_candidates/{id}",
  tags: ["AdoptionCandidate"],
  summary: "Get an adoption candidate by id",
  request: {
    params: AdoptionCandidateIdParamsSchema,
  },
  responses: {
    200: jsonResponse(AdoptionCandidateResponseSchema, "Adoption candidate"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    404: jsonResponse(NotFoundErrorResponseSchema, "Adoption candidate not found"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const createAdoptionCandidateRoute = createRoute({
  method: "post",
  path: "/adoption_candidates",
  tags: ["AdoptionCandidate"],
  summary: "Create an adoption candidate",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateAdoptionCandidateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: jsonResponse(AdoptionCandidateResponseSchema, "Created adoption candidate"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(UnauthorizedErrorResponseSchema, "Forbidden"),
    400: jsonResponse(ValidationErrorResponseSchema, "Invalid request"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const updateAdoptionCandidateRoute = createRoute({
  method: "patch",
  path: "/adoption_candidates/{id}",
  tags: ["AdoptionCandidate"],
  summary: "Update an adoption candidate",
  request: {
    params: AdoptionCandidateIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateAdoptionCandidateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: jsonResponse(AdoptionCandidateResponseSchema, "Updated adoption candidate"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(UnauthorizedErrorResponseSchema, "Forbidden"),
    404: jsonResponse(NotFoundErrorResponseSchema, "Adoption candidate not found"),
    400: jsonResponse(ValidationErrorResponseSchema, "Invalid request"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const deleteAdoptionCandidateRoute = createRoute({
  method: "delete",
  path: "/adoption_candidates/{id}",
  tags: ["AdoptionCandidate"],
  summary: "Delete an adoption candidate",
  request: {
    params: AdoptionCandidateIdParamsSchema,
  },
  responses: {
    204: {
      description: "Adoption candidate deleted",
    },
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(UnauthorizedErrorResponseSchema, "Forbidden"),
    404: jsonResponse(NotFoundErrorResponseSchema, "Adoption candidate not found"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const serializeAdoptionCandidate = (record: {
  id: string;
  name: string;
  cellphone: string;
  cpf: string | null;
  address: string | null;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
};

async function requireAdoptionCandidatesPermission(role?: string | null) {
  if (await hasPermission(role, "adoption_candidates.manage")) {
    return null;
  }

  return buildApiErrorResponse({
    code: "FORBIDDEN",
    message: "Você não tem permissão para executar esta ação.",
  });
}

app.openapi(listAdoptionCandidatesRoute, async (c) => {
  const records = await db
    .select()
    .from(adoptionCandidate)
    .orderBy(desc(adoptionCandidate.createdAt));

  return c.json(buildApiResponse(records.map(serializeAdoptionCandidate)), 200);
});

app.openapi(getAdoptionCandidateRoute, async (c) => {
  const { id } = c.req.valid("param");
  const record = await db.query.adoptionCandidate.findFirst({
    where: eq(adoptionCandidate.id, id),
  });

  if (!record) {
    return c.json(
      buildApiErrorResponse({
        code: "ADOPTION_CANDIDATE_NOT_FOUND",
        message: "Adoption candidate not found",
      }),
      404,
    );
  }

  return c.json(buildApiResponse(serializeAdoptionCandidate(record)), 200);
});

app.openapi(createAdoptionCandidateRoute, async (c) => {
  const payload = c.req.valid("json").data;
  const user = c.get("user");

  const permissionError = await requireAdoptionCandidatesPermission(user?.role);
  if (permissionError) {
    return c.json(permissionError, 403);
  }

  const now = new Date();
  const [record] = await db
    .insert(adoptionCandidate)
    .values({
      id: crypto.randomUUID(),
      name: payload.name,
      cellphone: payload.cellphone,
      cpf: payload.cpf ?? null,
      address: payload.address ?? null,
      observation: payload.observation ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(buildApiResponse(serializeAdoptionCandidate(record)), 201);
});

app.openapi(updateAdoptionCandidateRoute, async (c) => {
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json").data;
  const user = c.get("user");

  const permissionError = await requireAdoptionCandidatesPermission(user?.role);
  if (permissionError) {
    return c.json(permissionError, 403);
  }

  const [record] = await db
    .update(adoptionCandidate)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(eq(adoptionCandidate.id, id))
    .returning();

  if (!record) {
    return c.json(
      buildApiErrorResponse({
        code: "ADOPTION_CANDIDATE_NOT_FOUND",
        message: "Adoption candidate not found",
      }),
      404,
    );
  }

  return c.json(buildApiResponse(serializeAdoptionCandidate(record)), 200);
});

app.openapi(deleteAdoptionCandidateRoute, async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const permissionError = await requireAdoptionCandidatesPermission(user?.role);
  if (permissionError) {
    return c.json(permissionError, 403);
  }

  const [record] = await db
    .delete(adoptionCandidate)
    .where(eq(adoptionCandidate.id, id))
    .returning({ id: adoptionCandidate.id });

  if (!record) {
    return c.json(
      buildApiErrorResponse({
        code: "ADOPTION_CANDIDATE_NOT_FOUND",
        message: "Adoption candidate not found",
      }),
      404,
    );
  }

  return c.body(null, 204);
});

export { app as adoptionCandidatesRoutes };
