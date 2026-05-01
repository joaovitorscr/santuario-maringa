import type { MiddlewareHandler } from "hono";
import { buildApiErrorResponse } from "@/contracts/base";
import { AUTH_BASE_PATH, auth } from "@/lib/auth";

const isAuthRoute = (pathname: string) =>
  pathname === AUTH_BASE_PATH || pathname.startsWith(`${AUTH_BASE_PATH}/`);

export const requireSession: MiddlewareHandler = async (c, next) => {
  if (c.req.method === "OPTIONS" || isAuthRoute(new URL(c.req.url).pathname)) {
    await next();
    return;
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json(
      buildApiErrorResponse({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      }),
      401,
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
