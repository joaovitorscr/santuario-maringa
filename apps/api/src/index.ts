import "./env";
import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "./lib/auth";
import { createOpenApiServices } from "./lib/openapi";
import { corsMiddleware } from "./middleware/cors";
import { isDevelopmentMode, loggerMiddleware } from "./middleware/logger";
import { requireSession } from "./middleware/require-session";
import { adoptionCandidatesRoutes } from "./routes/adoption-candidates";
import { adoptionRoutes } from "./routes/adoptions";
import { adminRoutes } from "./routes/admin";
import { registerAuthRoutes } from "./routes/auth";
import { catRoutes } from "./routes/cat";
import { registerDocsRoutes } from "./routes/docs";

const app = new OpenAPIHono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const { getOpenApiDocument, getLlmsMarkdown } = createOpenApiServices(app);

app.use("*", corsMiddleware);
if (isDevelopmentMode()) {
  app.use("*", loggerMiddleware);
}
app.use("*", requireSession);

app.route("/", adoptionCandidatesRoutes);
app.route("/", adoptionRoutes);
app.route("/", adminRoutes);
app.route("/", catRoutes);

registerDocsRoutes(app, getOpenApiDocument, getLlmsMarkdown);
registerAuthRoutes(app);

export default app;

export type AppType = typeof app;
