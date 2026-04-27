import { db } from "@/db";
import { adoptionCandidate } from "@/db/schema/adoption-candidate";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

const adoptionCandidateBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  cellphone: t.String({ minLength: 1, maxLength: 15 }),
  cpf: t.Optional(t.Nullable(t.String({ maxLength: 14 }))),
  address: t.Optional(t.Nullable(t.String({ maxLength: 255 }))),
  observation: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
});

const adoptionCandidatePatchBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  cellphone: t.Optional(t.String({ minLength: 1, maxLength: 15 })),
  cpf: t.Optional(t.Nullable(t.String({ maxLength: 14 }))),
  address: t.Optional(t.Nullable(t.String({ maxLength: 255 }))),
  observation: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
});

export const adoptionCandidatesRoutes = new Elysia({ prefix: "/adoption_candidates" })
  .get("/", async () => {
    return db.select().from(adoptionCandidate).orderBy(desc(adoptionCandidate.createdAt));
  })
  .get(
    "/:id",
    async ({ params, status }) => {
      const record = await db.query.adoptionCandidate.findFirst({
        where: eq(adoptionCandidate.id, params.id),
      });

      if (!record) {
        return status(404, { message: "Adoption candidate not found" });
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
        .insert(adoptionCandidate)
        .values({
          id: crypto.randomUUID(),
          name: body.name,
          cellphone: body.cellphone,
          cpf: body.cpf ?? null,
          address: body.address ?? null,
          observation: body.observation ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      set.status = 201;

      return {
        ...record,
        createdBy: {
          id: session.user.id,
          name: session.user.name,
        },
      };
    },
    {
      body: adoptionCandidateBody,
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
        .update(adoptionCandidate)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(adoptionCandidate.id, params.id))
        .returning();

      if (!record) {
        return status(404, { message: "Adoption candidate not found" });
      }

      return record;
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
      body: adoptionCandidatePatchBody,
    },
  )
  .delete(
    "/:id",
    async ({ params, request, status, set }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        return status(401, { message: "Unauthorized" });
      }

      const [record] = await db
        .delete(adoptionCandidate)
        .where(eq(adoptionCandidate.id, params.id))
        .returning();

      if (!record) {
        return status(404, { message: "Adoption candidate not found" });
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
