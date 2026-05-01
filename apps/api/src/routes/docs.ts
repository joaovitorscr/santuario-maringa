import type { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { Env, Schema } from "hono";

type GetOpenApiDocument = (origin: string) => Promise<unknown>;
type GetLlmsMarkdown = (origin: string) => Promise<string>;

export const registerDocsRoutes = <E extends Env, S extends Schema, B extends string>(
  app: OpenAPIHono<E, S, B>,
  getOpenApiDocument: GetOpenApiDocument,
  getLlmsMarkdown: GetLlmsMarkdown,
) => {
  app.get("/doc", async (c) => {
    return c.json(await getOpenApiDocument(new URL(c.req.url).origin));
  });

  app.get("/scalar", Scalar({ url: "/doc", theme: "green", pageTitle: "Santuário Maringa" }));

  app.get("/llms.txt", async (c) => {
    return c.text(await getLlmsMarkdown(new URL(c.req.url).origin));
  });
};
