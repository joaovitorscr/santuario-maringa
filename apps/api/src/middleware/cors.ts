import { cors } from "hono/cors";
import { resolveCorsOrigin } from "@/lib/trusted-origins";

export const corsMiddleware = cors({
  origin: resolveCorsOrigin,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
});
