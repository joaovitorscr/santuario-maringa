import { db } from "@/db";
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

type CatEnv = {
  Variables: {
    user: { id: string; name: string; role?: string | null } | null;
  };
};

const app = new OpenAPIHono<CatEnv>();

const AdoptionStatusSchema = z
  .enum(["Adopted", "Adoption Process", "Available", "Not Available"])
  .openapi("CatAdoptionStatus");

const GenderSchema = z.enum(["Male", "Female"]).openapi("CatGender");

const IsoDateTimeSchema = z.iso.datetime();

const CatIdParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi("CatIdParams");

const FurTypeSummarySchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    pictureBase64: z.string().nullable(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  })
  .openapi("FurTypeSummary");

const UserSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    username: z.string().nullable(),
    displayUsername: z.string().nullable(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  })
  .openapi("CatCreatedByUser");

const CatSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    pictureBase64: z.string().nullable(),
    adoptionTermBase64: z.string().nullable(),
    adoptionTermMimeType: z.string().nullable(),
    medicalExamBase64: z.string().nullable(),
    medicalExamMimeType: z.string().nullable(),
    furTypeId: z.uuid().nullable(),
    adoptionStatus: AdoptionStatusSchema,
    entryDate: IsoDateTimeSchema,
    adoptionDate: IsoDateTimeSchema.nullable(),
    birthDate: IsoDateTimeSchema.nullable(),
    race: z.string(),
    gender: GenderSchema,
    isCastrated: z.boolean(),
    isVaccinated: z.boolean(),
    weightKg: z.string().nullable(),
    isFiv: z.boolean().nullable(),
    isFelv: z.boolean().nullable(),
    observation: z.string().nullable(),
    createdByUserName: z.string(),
    createdByUserId: z.string(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    furType: FurTypeSummarySchema.nullable(),
    createdByUser: UserSummarySchema,
  })
  .openapi("Cat");

const CatListResponseSchema = createApiResponseSchema(z.array(CatSchema), "CatListResponse");
const CatResponseSchema = createApiResponseSchema(CatSchema, "CatResponse");

const CatMutationBodySchema = z
  .object({
    name: z.string().min(1),
    pictureBase64: z.string().nullable().optional(),
    adoptionTermBase64: z.string().nullable().optional(),
    adoptionTermMimeType: z.string().nullable().optional(),
    medicalExamBase64: z.string().nullable().optional(),
    medicalExamMimeType: z.string().nullable().optional(),
    furTypeId: z.uuid().nullable().optional(),
    adoptionStatus: AdoptionStatusSchema,
    entryDate: IsoDateTimeSchema,
    adoptionDate: IsoDateTimeSchema.nullable().optional(),
    birthDate: IsoDateTimeSchema.nullable().optional(),
    race: z.string().min(1),
    gender: GenderSchema,
    isCastrated: z.boolean(),
    isVaccinated: z.boolean(),
    weightKg: z
      .string()
      .regex(/^[0-9]+(\.[0-9]{1,2})?$/)
      .nullable()
      .optional(),
    isFiv: z.boolean().nullable().optional(),
    isFelv: z.boolean().nullable().optional(),
    observation: z.string().max(500).nullable().optional(),
  })
  .openapi("CatMutationBody");

const CreateCatRequestSchema = createApiRequestSchema(CatMutationBodySchema, "CreateCatRequest");
const UpdateCatRequestSchema = createApiRequestSchema(
  CatMutationBodySchema.partial(),
  "UpdateCatRequest",
);

const listCatsRoute = createRoute({
  method: "get",
  path: "/cat",
  tags: ["Cat"],
  summary: "List cats",
  responses: {
    200: jsonResponse(CatListResponseSchema, "Cat list"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const getCatRoute = createRoute({
  method: "get",
  path: "/cat/{id}",
  tags: ["Cat"],
  summary: "Get a cat by id",
  request: {
    params: CatIdParamsSchema,
  },
  responses: {
    200: jsonResponse(CatResponseSchema, "Cat"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    404: jsonResponse(NotFoundErrorResponseSchema, "Cat not found"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const createCatRoute = createRoute({
  method: "post",
  path: "/cat",
  tags: ["Cat"],
  summary: "Create a cat",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateCatRequestSchema,
        },
      },
    },
  },
  responses: {
    201: jsonResponse(CatResponseSchema, "Created cat"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(UnauthorizedErrorResponseSchema, "Forbidden"),
    400: jsonResponse(ValidationErrorResponseSchema, "Invalid request"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const updateCatRoute = createRoute({
  method: "patch",
  path: "/cat/{id}",
  tags: ["Cat"],
  summary: "Update a cat",
  request: {
    params: CatIdParamsSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: UpdateCatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: jsonResponse(CatResponseSchema, "Updated cat"),
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(UnauthorizedErrorResponseSchema, "Forbidden"),
    404: jsonResponse(NotFoundErrorResponseSchema, "Cat not found"),
    400: jsonResponse(ValidationErrorResponseSchema, "Invalid request"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const deleteCatRoute = createRoute({
  method: "delete",
  path: "/cat/{id}",
  tags: ["Cat"],
  summary: "Delete a cat",
  request: {
    params: CatIdParamsSchema,
  },
  responses: {
    204: {
      description: "Cat deleted",
    },
    401: jsonResponse(UnauthorizedErrorResponseSchema, "Unauthorized"),
    403: jsonResponse(UnauthorizedErrorResponseSchema, "Forbidden"),
    404: jsonResponse(NotFoundErrorResponseSchema, "Cat not found"),
    500: jsonResponse(InternalServerErrorResponseSchema, "Unexpected server error"),
  },
});

const toIsoString = (value: Date | null | undefined) => value?.toISOString() ?? null;

type CatRecord = NonNullable<Awaited<ReturnType<typeof getCatById>>>;

const serializeCat = (record: CatRecord) => {
  return {
    ...record,
    entryDate: record.entryDate.toISOString(),
    adoptionDate: toIsoString(record.adoptionDate),
    birthDate: toIsoString(record.birthDate),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    furType: record.furType
      ? {
          ...record.furType,
          createdAt: record.furType.createdAt.toISOString(),
          updatedAt: record.furType.updatedAt.toISOString(),
        }
      : null,
    createdByUser: {
      ...record.createdByUser,
      username: record.createdByUser.username ?? null,
      displayUsername: record.createdByUser.displayUsername ?? null,
      image: record.createdByUser.image ?? null,
      createdAt: record.createdByUser.createdAt.toISOString(),
      updatedAt: record.createdByUser.updatedAt.toISOString(),
    },
  };
};

async function getCatById(id: string) {
  return db.query.cat.findFirst({
    where: eq(cat.id, id),
    with: {
      furType: true,
      createdByUser: true,
    },
  });
}

async function requireCatsPermission(role?: string | null) {
  if (await hasPermission(role, "cats.manage")) {
    return null;
  }

  return buildApiErrorResponse({
    code: "FORBIDDEN",
    message: "Você não tem permissão para executar esta ação.",
  });
}

app.openapi(listCatsRoute, async (c) => {
  const records = await db.query.cat.findMany({
    orderBy: [desc(cat.createdAt)],
    with: {
      furType: true,
      createdByUser: true,
    },
  });

  return c.json(buildApiResponse(records.map(serializeCat)), 200);
});

app.openapi(getCatRoute, async (c) => {
  const { id } = c.req.valid("param");
  const record = await getCatById(id);

  if (!record) {
    return c.json(
      buildApiErrorResponse({
        code: "CAT_NOT_FOUND",
        message: "Cat not found",
      }),
      404,
    );
  }

  return c.json(buildApiResponse(serializeCat(record)), 200);
});

app.openapi(createCatRoute, async (c) => {
  const payload = c.req.valid("json").data;
  const user = c.get("user");

  if (!user) {
    return c.json(
      buildApiErrorResponse({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      }),
      401,
    );
  }

  const permissionError = await requireCatsPermission(user.role);
  if (permissionError) {
    return c.json(permissionError, 403);
  }

  const now = new Date();
  const [createdRecord] = await db
    .insert(cat)
    .values({
      id: crypto.randomUUID(),
      name: payload.name,
      pictureBase64: payload.pictureBase64 ?? null,
      adoptionTermBase64: payload.adoptionTermBase64 ?? null,
      adoptionTermMimeType: payload.adoptionTermMimeType ?? null,
      medicalExamBase64: payload.medicalExamBase64 ?? null,
      medicalExamMimeType: payload.medicalExamMimeType ?? null,
      furTypeId: payload.furTypeId ?? null,
      adoptionStatus: payload.adoptionStatus,
      entryDate: new Date(payload.entryDate),
      adoptionDate: payload.adoptionDate ? new Date(payload.adoptionDate) : null,
      birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
      race: payload.race,
      gender: payload.gender,
      isCastrated: payload.isCastrated,
      isVaccinated: payload.isVaccinated,
      weightKg: payload.weightKg ?? null,
      isFiv: payload.isFiv ?? false,
      isFelv: payload.isFelv ?? false,
      observation: payload.observation ?? null,
      createdByUserId: user.id,
      createdByUserName: user.name,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: cat.id });

  const record = await getCatById(createdRecord.id);

  if (!record) {
    return c.json(
      buildApiErrorResponse({
        code: "CAT_FETCH_FAILED",
        message: "Created cat could not be loaded",
      }),
      500,
    );
  }

  return c.json(buildApiResponse(serializeCat(record)), 201);
});

app.openapi(updateCatRoute, async (c) => {
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json").data;
  const user = c.get("user");

  const permissionError = await requireCatsPermission(user?.role);
  if (permissionError) {
    return c.json(permissionError, 403);
  }

  const [updatedRecord] = await db
    .update(cat)
    .set({
      ...payload,
      entryDate: payload.entryDate ? new Date(payload.entryDate) : undefined,
      adoptionDate:
        payload.adoptionDate === undefined
          ? undefined
          : payload.adoptionDate === null
            ? null
            : new Date(payload.adoptionDate),
      birthDate:
        payload.birthDate === undefined
          ? undefined
          : payload.birthDate === null
            ? null
            : new Date(payload.birthDate),
      updatedAt: new Date(),
    })
    .where(eq(cat.id, id))
    .returning({ id: cat.id });

  if (!updatedRecord) {
    return c.json(
      buildApiErrorResponse({
        code: "CAT_NOT_FOUND",
        message: "Cat not found",
      }),
      404,
    );
  }

  const record = await getCatById(updatedRecord.id);

  if (!record) {
    return c.json(
      buildApiErrorResponse({
        code: "CAT_FETCH_FAILED",
        message: "Updated cat could not be loaded",
      }),
      500,
    );
  }

  return c.json(buildApiResponse(serializeCat(record)), 200);
});

app.openapi(deleteCatRoute, async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  const permissionError = await requireCatsPermission(user?.role);
  if (permissionError) {
    return c.json(permissionError, 403);
  }

  const [deletedRecord] = await db.delete(cat).where(eq(cat.id, id)).returning({ id: cat.id });

  if (!deletedRecord) {
    return c.json(
      buildApiErrorResponse({
        code: "CAT_NOT_FOUND",
        message: "Cat not found",
      }),
      404,
    );
  }

  return c.body(null, 204);
});

export { app as catRoutes };
