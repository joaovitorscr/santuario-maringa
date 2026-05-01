import type { OpenAPIHono } from "@hono/zod-openapi";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import type { Env, Schema } from "hono";
import { AUTH_BASE_PATH, auth } from "./auth";

type AuthOpenApiDocument = Awaited<ReturnType<typeof auth.api.generateOpenAPISchema>>;
type AppOpenApiDocument<TApp extends OpenAPIHono<any, any, any>> = ReturnType<
  TApp["getOpenAPI31Document"]
>;

const prefixPath = (prefix: string, path: string) => {
  if (!prefix || prefix === "/") {
    return path;
  }

  const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  return `${normalizedPrefix}${path}`;
};

const mergeOpenApiDocuments = (
  appDocument: AppOpenApiDocument<OpenAPIHono>,
  authDocument: AuthOpenApiDocument,
): AppOpenApiDocument<OpenAPIHono> => {
  const authPaths = Object.fromEntries(
    Object.entries(authDocument.paths).map(([path, pathItem]) => [
      prefixPath(AUTH_BASE_PATH, path),
      pathItem,
    ]),
  );

  const authTags = authDocument.tags ?? [];
  const appTags = appDocument.tags ?? [];
  const tags = [...appTags];

  for (const tag of authTags) {
    if (!tags.some((existingTag) => existingTag.name === tag.name)) {
      tags.push(tag);
    }
  }

  return {
    ...appDocument,
    tags,
    paths: {
      ...appDocument.paths,
      ...authPaths,
    },
    components: {
      ...authDocument.components,
      ...appDocument.components,
      schemas: {
        ...(authDocument.components?.schemas ?? {}),
        ...(appDocument.components?.schemas ?? {}),
      },
      securitySchemes: {
        ...(authDocument.components?.securitySchemes ?? {}),
        ...(appDocument.components?.securitySchemes ?? {}),
      },
      responses: {
        ...(authDocument.components?.responses ?? {}),
        ...(appDocument.components?.responses ?? {}),
      },
      parameters: {
        ...(authDocument.components?.parameters ?? {}),
        ...(appDocument.components?.parameters ?? {}),
      },
      requestBodies: {
        ...(authDocument.components?.requestBodies ?? {}),
        ...(appDocument.components?.requestBodies ?? {}),
      },
    },
  };
};

export const createOpenApiServices = <E extends Env, S extends Schema, B extends string>(
  app: OpenAPIHono<E, S, B>,
) => {
  let authOpenApiDocument: AuthOpenApiDocument | null = null;
  const llmsMarkdownByOrigin = new Map<string, string>();

  const getAuthOpenApiDocument = async () => {
    authOpenApiDocument ??= await auth.api.generateOpenAPISchema();
    return authOpenApiDocument;
  };

  const getAppOpenApiDocument = (origin: string) => {
    return app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: {
        title: "Santuário Maringa",
        version: "v1",
        description: "OpenAPI document for the Santuário Maringa API.",
      },
      servers: [{ url: origin }],
    });
  };

  const getOpenApiDocument = async (origin: string) => {
    const appDocument = getAppOpenApiDocument(origin);
    const authDocument = await getAuthOpenApiDocument();
    return mergeOpenApiDocuments(appDocument, authDocument);
  };

  const getLlmsMarkdown = async (origin: string) => {
    const cachedMarkdown = llmsMarkdownByOrigin.get(origin);
    if (cachedMarkdown) {
      return cachedMarkdown;
    }

    const markdown = await createMarkdownFromOpenApi(await getOpenApiDocument(origin));
    llmsMarkdownByOrigin.set(origin, markdown);
    return markdown;
  };

  return {
    getOpenApiDocument,
    getLlmsMarkdown,
  };
};
