import { db } from "@/db";
import { cat } from "@/db/schema/cat";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

const adoptionStatusSchema = t.Union([
  t.Literal("Adopted"),
  t.Literal("Adoption Process"),
  t.Literal("Available"),
  t.Literal("Not Available"),
]);

const genderSchema = t.Union([t.Literal("Male"), t.Literal("Female")]);

const catBody = t.Object({
  name: t.String({ minLength: 1 }),
  pictureBase64: t.Optional(t.Nullable(t.String())),
  adoptionTermBase64: t.Optional(t.Nullable(t.String())),
  adoptionTermMimeType: t.Optional(t.Nullable(t.String())),
  medicalExamBase64: t.Optional(t.Nullable(t.String())),
  medicalExamMimeType: t.Optional(t.Nullable(t.String())),
  furTypeId: t.Optional(t.Nullable(t.String({ format: "uuid" }))),
  adoptionStatus: adoptionStatusSchema,
  entryDate: t.String({ format: "date-time" }),
  adoptionDate: t.Optional(t.Nullable(t.String({ format: "date-time" }))),
  birthDate: t.Optional(t.Nullable(t.String({ format: "date-time" }))),
  race: t.String({ minLength: 1 }),
  gender: genderSchema,
  isCastrated: t.Boolean(),
  isVaccinated: t.Boolean(),
  weightKg: t.Optional(t.Nullable(t.String({ pattern: "^[0-9]+(\\.[0-9]{1,2})?$" }))),
  isFiv: t.Optional(t.Nullable(t.Boolean())),
  isFelv: t.Optional(t.Nullable(t.Boolean())),
  observation: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
});

const catPatchBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  pictureBase64: t.Optional(t.Nullable(t.String())),
  adoptionTermBase64: t.Optional(t.Nullable(t.String())),
  adoptionTermMimeType: t.Optional(t.Nullable(t.String())),
  medicalExamBase64: t.Optional(t.Nullable(t.String())),
  medicalExamMimeType: t.Optional(t.Nullable(t.String())),
  furTypeId: t.Optional(t.Nullable(t.String({ format: "uuid" }))),
  adoptionStatus: t.Optional(adoptionStatusSchema),
  entryDate: t.Optional(t.String({ format: "date-time" })),
  adoptionDate: t.Optional(t.Nullable(t.String({ format: "date-time" }))),
  birthDate: t.Optional(t.Nullable(t.String({ format: "date-time" }))),
  race: t.Optional(t.String({ minLength: 1 })),
  gender: t.Optional(genderSchema),
  isCastrated: t.Optional(t.Boolean()),
  isVaccinated: t.Optional(t.Boolean()),
  weightKg: t.Optional(t.Nullable(t.String({ pattern: "^[0-9]+(\\.[0-9]{1,2})?$" }))),
  isFiv: t.Optional(t.Nullable(t.Boolean())),
  isFelv: t.Optional(t.Nullable(t.Boolean())),
  observation: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
});

export const catRoutes = new Elysia({ prefix: "/cat" })
  .get("/", async () => {
    return db.query.cat.findMany({
      orderBy: [desc(cat.createdAt)],
      with: {
        furType: true,
        createdByUser: true,
      },
    });
  })
  .get(
    "/:id",
    async ({ params, status }) => {
      const record = await db.query.cat.findFirst({
        where: eq(cat.id, params.id),
        with: {
          furType: true,
          createdByUser: true,
        },
      });

      if (!record) {
        return status(404, { message: "Cat not found" });
      }

      return record;
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
    },
  )
  .post(
    "/",
    async ({ body, request, set, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        return status(401, { message: "Unauthorized" });
      }

      const now = new Date();
      const [record] = await db
        .insert(cat)
        .values({
          id: crypto.randomUUID(),
          name: body.name,
          pictureBase64: body.pictureBase64 ?? null,
          adoptionTermBase64: body.adoptionTermBase64 ?? null,
          adoptionTermMimeType: body.adoptionTermMimeType ?? null,
          medicalExamBase64: body.medicalExamBase64 ?? null,
          medicalExamMimeType: body.medicalExamMimeType ?? null,
          furTypeId: body.furTypeId ?? null,
          adoptionStatus: body.adoptionStatus,
          entryDate: new Date(body.entryDate),
          adoptionDate: body.adoptionDate ? new Date(body.adoptionDate) : null,
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
          race: body.race,
          gender: body.gender,
          isCastrated: body.isCastrated,
          isVaccinated: body.isVaccinated,
          weightKg: body.weightKg ?? null,
          isFiv: body.isFiv ?? false,
          isFelv: body.isFelv ?? false,
          observation: body.observation ?? null,
          createdByUserId: session.user.id,
          createdByUserName: session.user.name,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      set.status = 201;

      return record;
    },
    {
      body: catBody,
    },
  )
  .patch(
    "/:id",
    async ({ body, request, params, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        return status(401, { message: "Unauthorized" });
      }

      const [record] = await db
        .update(cat)
        .set({
          ...body,
          entryDate: body.entryDate ? new Date(body.entryDate) : undefined,
          adoptionDate:
            body.adoptionDate === undefined
              ? undefined
              : body.adoptionDate === null
                ? null
                : new Date(body.adoptionDate),
          birthDate:
            body.birthDate === undefined
              ? undefined
              : body.birthDate === null
                ? null
                : new Date(body.birthDate),
          updatedAt: new Date(),
        })
        .where(eq(cat.id, params.id))
        .returning();

      if (!record) {
        return status(404, { message: "Cat not found" });
      }

      return record;
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
      body: catPatchBody,
    },
  )
  .delete(
    "/:id",
    async ({ params, request, status, set }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        return status(401, { message: "Unauthorized" });
      }

      const [record] = await db.delete(cat).where(eq(cat.id, params.id)).returning();

      if (!record) {
        return status(404, { message: "Cat not found" });
      }

      set.status = 204;
      return null;
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
    },
  );
