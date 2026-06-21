import { db } from "@/db";
import { adoption } from "@/db/schema/adoption";
import { adoptionCandidate } from "@/db/schema/adoption-candidate";
import { cat } from "@/db/schema/cat";
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
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

type AdoptionEnv = {
  Variables: {
    user: { role?: string | null } | null;
  };
};

const app = new OpenAPIHono<AdoptionEnv>();

const IsoDateTimeSchema = z.iso.datetime();

const AdoptionCandidateSummarySchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    cellphone: z.string(),
    cpf: z.string().nullable(),
  })
  .openapi("AdoptionCandidateSummary");

const AdoptionCatSummarySchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    pictureBase64: z.string().nullable(),
    adoptionStatus: z.enum(["Adopted", "Adoption Process", "Available", "Not Available"]),
    adoptionDate: IsoDateTimeSchema.nullable(),
  })
  .openapi("AdoptionCatSummary");

const AdoptionSchema = z
  .object({
    id: z.uuid(),
    adoptionCandidateId: z.uuid(),
    catId: z.uuid(),
    adoptionDate: IsoDateTimeSchema,
    observation: z.string().nullable(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    adoptionCandidate: AdoptionCandidateSummarySchema,
    cat: AdoptionCatSummarySchema,
  })
  .openapi("Adoption");

const AdoptionMutationBodySchema = z
  .object({
    adoptionCandidateId: z.uuid(),
    catId: z.uuid(),
    adoptionDate: IsoDateTimeSchema,
    observation: z.string().trim().max(500).nullable().optional(),
  })
  .openapi("AdoptionMutationBody");

const AdoptionListResponseSchema = createApiResponseSchema(
  z.array(AdoptionSchema),
  "AdoptionListResponse",
);
const AdoptionResponseSchema = createApiResponseSchema(AdoptionSchema, "AdoptionResponse");
const CreateAdoptionRequestSchema = createApiRequestSchema(
  AdoptionMutationBodySchema,
  "CreateAdoptionRequest",
);

const listAdoptionsRoute = createRoute({
  method: "get",
  path: "/adoptions",
  tags: ["Adoption"],
  summary: "List adoptions",
  responses: {
    200: jsonResponse(AdoptionListResponseSchema, "Adoption list"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const createAdoptionRoute = createRoute({
  method: "post",
  path: "/adoptions",
  tags: ["Adoption"],
  summary: "Create an adoption",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateAdoptionRequestSchema,
        },
      },
    },
  },
  responses: {
    201: jsonResponse(AdoptionResponseSchema, "Created adoption"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(UnauthorizedErrorResponseSchema, "Forbidden"),
    404: jsonResponse(NotFoundErrorResponseSchema, "Candidate or cat not found"),
    400: jsonResponse(ValidationErrorResponseSchema, "Invalid request"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const toIsoString = (value: Date | null | undefined) => value?.toISOString() ?? null;

type AdoptionRecord = NonNullable<Awaited<ReturnType<typeof getAdoptionById>>>;

const serializeAdoption = (record: AdoptionRecord) => {
  return {
    id: record.id,
    adoptionCandidateId: record.adoptionCandidateId,
    catId: record.catId,
    adoptionDate: record.adoptionDate.toISOString(),
    observation: record.observation,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    cat: {
      id: record.cat.id,
      name: record.cat.name,
      pictureBase64: record.cat.pictureBase64,
      adoptionStatus: record.cat.adoptionStatus,
      adoptionDate: toIsoString(record.cat.adoptionDate),
    },
    adoptionCandidate: {
      id: record.adoptionCandidate.id,
      name: record.adoptionCandidate.name,
      cellphone: record.adoptionCandidate.cellphone,
      cpf: record.adoptionCandidate.cpf,
    },
  };
};

async function getAdoptionById(id: string) {
  return db.query.adoption.findFirst({
    where: eq(adoption.id, id),
    with: {
      adoptionCandidate: true,
      cat: true,
    },
  });
}

async function requireAdoptionsPermission(role?: string | null) {
  if (await hasPermission(role, "adoptions.manage")) {
    return null;
  }

  return buildApiErrorResponse({
    code: "FORBIDDEN",
    message: "Você não tem permissão para executar esta ação.",
  });
}

app.openapi(listAdoptionsRoute, async (c) => {
  const records = await db.query.adoption.findMany({
    orderBy: [desc(adoption.adoptionDate)],
    with: {
      adoptionCandidate: true,
      cat: true,
    },
  });

  return c.json(buildApiResponse(records.map(serializeAdoption)), 200);
});

app.openapi(createAdoptionRoute, async (c) => {
  const payload = c.req.valid("json").data;
  const adoptionDate = new Date(payload.adoptionDate);
  const user = c.get("user");

  const permissionError = await requireAdoptionsPermission(user?.role);
  if (permissionError) {
    return c.json(permissionError, 403);
  }

  const [candidateRecord, catRecord] = await Promise.all([
    db.query.adoptionCandidate.findFirst({
      where: eq(adoptionCandidate.id, payload.adoptionCandidateId),
    }),
    db.query.cat.findFirst({
      where: eq(cat.id, payload.catId),
    }),
  ]);

  if (!candidateRecord) {
    return c.json(
      buildApiErrorResponse({
        code: "ADOPTION_CANDIDATE_NOT_FOUND",
        message: "Adoption candidate not found",
      }),
      404,
    );
  }

  if (!catRecord) {
    return c.json(
      buildApiErrorResponse({
        code: "CAT_NOT_FOUND",
        message: "Cat not found",
      }),
      404,
    );
  }

  if (catRecord.adoptionStatus === "Adopted") {
    return c.json(
      buildApiErrorResponse({
        code: "CAT_ALREADY_ADOPTED",
        message: "Cat already has adopted status",
      }),
      400,
    );
  }

  const now = new Date();
  const [createdRecord] = await db.transaction(async (tx) => {
    const [newAdoption] = await tx
      .insert(adoption)
      .values({
        id: crypto.randomUUID(),
        adoptionCandidateId: payload.adoptionCandidateId,
        catId: payload.catId,
        adoptionDate,
        observation: payload.observation ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: adoption.id });

    await tx
      .update(cat)
      .set({
        adoptionStatus: "Adopted",
        adoptionDate,
        updatedAt: now,
      })
      .where(eq(cat.id, payload.catId));

    return [newAdoption];
  });

  if (!createdRecord) {
    return c.json(
      buildApiErrorResponse({
        code: "ADOPTION_CREATE_FAILED",
        message: "Created adoption could not be loaded",
      }),
      500,
    );
  }

  const record = await getAdoptionById(createdRecord.id);

  if (!record) {
    return c.json(
      buildApiErrorResponse({
        code: "ADOPTION_FETCH_FAILED",
        message: "Created adoption could not be loaded",
      }),
      500,
    );
  }

  return c.json(buildApiResponse(serializeAdoption(record)), 201);
});

export { app as adoptionRoutes };
