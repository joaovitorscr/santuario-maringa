import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Env, Schema } from "hono";
import { AUTH_BASE_PATH, auth } from "@/lib/auth";

export const registerAuthRoutes = <E extends Env, S extends Schema, B extends string>(
  app: OpenAPIHono<E, S, B>,
) => {
  app.on(["POST", "GET"], `${AUTH_BASE_PATH}/*`, (c) => {
    return auth.handler(c.req.raw);
  });
};
