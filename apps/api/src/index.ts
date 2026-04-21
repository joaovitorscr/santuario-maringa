import { Elysia } from "elysia";
import openapi from "@elysiajs/openapi";
import { betterAuthPlugin, OpenAPI } from "./plugins/better-auth";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(betterAuthPlugin)
  .listen(process.env.port ?? 8000);

console.log(
  `🦊 Elysia is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 OpenAPI Documentation is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}/openapi`,
);
