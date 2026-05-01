import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: "santuario-maringa://",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
});
