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
import { desc, eq } from "drizzle-orm";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

const IsoDateTimeSchema = z.iso.datetime();

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

const AdoptionCandidateMutationBodySchema = z
  .object({
    name: z.string().min(1).max(255),
    cellphone: z.string().min(1).max(15),
    cpf: z.string().max(14).nullable().optional(),
    address: z.string().max(255).nullable().optional(),
    observation: z.string().max(500).nullable().optional(),
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
