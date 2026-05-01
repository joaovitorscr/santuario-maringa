import { z } from "@hono/zod-openapi";
import type { ZodTypeAny } from "zod";

export const SortOrderSchema = z.enum(["asc", "desc"]).openapi("SortOrder");

export const ApiResponseMetaSchema = z
  .object({
    timestamp: z.iso.datetime().openapi({
      example: "2026-05-01T18:00:00.000Z",
    }),
    requestId: z.string().optional().openapi({
      example: "req_01JTSG7M9A9A2A0J4WQ7D0Y2AB",
    }),
  })
  .openapi("ApiResponseMeta");

export const ApiErrorSchema = z
  .object({
    code: z.string().openapi({
      example: "UNAUTHORIZED",
    }),
    message: z.string().openapi({
      example: "Unauthorized",
    }),
    details: z
      .record(z.string(), z.string())
      .optional()
      .openapi({
        example: {
          field: "email",
        },
      }),
  })
  .openapi("ApiError");

export const PaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).openapi({
      example: 1,
    }),
    pageSize: z.coerce.number().int().min(1).max(100).default(20).openapi({
      example: 20,
    }),
    search: z.string().trim().optional().openapi({
      example: "maria",
    }),
    sortBy: z.string().optional().openapi({
      example: "createdAt",
    }),
    sortOrder: SortOrderSchema.default("desc"),
  })
  .openapi("PaginationQuery");

export const PaginationMetaSchema = z
  .object({
    page: z.number().int().min(1).openapi({
      example: 1,
    }),
    pageSize: z.number().int().min(1).openapi({
      example: 20,
    }),
    totalItems: z.number().int().min(0).openapi({
      example: 120,
    }),
    totalPages: z.number().int().min(0).openapi({
      example: 6,
    }),
    hasNextPage: z.boolean().openapi({
      example: true,
    }),
    hasPreviousPage: z.boolean().openapi({
      example: false,
    }),
  })
  .openapi("PaginationMeta");

export const createApiRequestSchema = <TDataSchema extends ZodTypeAny>(
  dataSchema: TDataSchema,
  name: string,
) => {
  return z
    .object({
      data: dataSchema,
    })
    .openapi(name);
};

export const createApiResponseSchema = <TDataSchema extends ZodTypeAny>(
  dataSchema: TDataSchema,
  name: string,
) => {
  return z
    .object({
      success: z.literal(true),
      data: dataSchema,
      meta: ApiResponseMetaSchema,
    })
    .openapi(name);
};

export const createPaginatedResponseSchema = <TItemSchema extends ZodTypeAny>(
  itemSchema: TItemSchema,
  name: string,
) => {
  return z
    .object({
      success: z.literal(true),
      data: z.array(itemSchema),
      pagination: PaginationMetaSchema,
      meta: ApiResponseMetaSchema,
    })
    .openapi(name);
};

export const createApiErrorResponseSchema = (name: string) => {
  return z
    .object({
      success: z.literal(false),
      error: ApiErrorSchema,
      meta: ApiResponseMetaSchema,
    })
    .openapi(name);
};

export const UnauthorizedErrorResponseSchema = createApiErrorResponseSchema(
  "UnauthorizedErrorResponse",
);

export const ValidationErrorResponseSchema =
  createApiErrorResponseSchema("ValidationErrorResponse");

export const NotFoundErrorResponseSchema = createApiErrorResponseSchema("NotFoundErrorResponse");

export const InternalServerErrorResponseSchema = createApiErrorResponseSchema(
  "InternalServerErrorResponse",
);

export const jsonContent = <TSchema extends ZodTypeAny>(schema: TSchema) => ({
  "application/json": {
    schema,
  },
});

export const jsonResponse = <TSchema extends ZodTypeAny>(schema: TSchema, description: string) => ({
  description,
  content: jsonContent(schema),
});

export type ApiRequest<TData> = {
  data: TData;
};

export type ApiResponseMeta = z.infer<typeof ApiResponseMetaSchema>;

export type ApiError = z.infer<typeof ApiErrorSchema>;

export type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  meta: ApiResponseMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiError;
  meta: ApiResponseMeta;
};

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export type PaginatedResponse<TItem> = {
  success: true;
  data: TItem[];
  pagination: PaginationMeta;
  meta: ApiResponseMeta;
};

type BuildMetaOptions = {
  requestId?: string;
  timestamp?: string;
};

type BuildErrorOptions = {
  code: string;
  message: string;
  details?: Record<string, string>;
} & BuildMetaOptions;

type BuildPaginatedResponseOptions = {
  page: number;
  pageSize: number;
  totalItems: number;
} & BuildMetaOptions;

const buildResponseMeta = (options?: BuildMetaOptions): ApiResponseMeta => {
  return {
    timestamp: options?.timestamp ?? new Date().toISOString(),
    requestId: options?.requestId,
  };
};

export const buildApiResponse = <TData>(
  data: TData,
  options?: BuildMetaOptions,
): ApiSuccessResponse<TData> => {
  return {
    success: true,
    data,
    meta: buildResponseMeta(options),
  };
};

export const buildApiErrorResponse = (options: BuildErrorOptions): ApiErrorResponse => {
  return {
    success: false,
    error: {
      code: options.code,
      message: options.message,
      details: options.details,
    },
    meta: buildResponseMeta(options),
  };
};

export const buildPaginatedResponse = <TItem>(
  data: TItem[],
  options: BuildPaginatedResponseOptions,
): PaginatedResponse<TItem> => {
  const totalPages =
    options.totalItems === 0 ? 0 : Math.ceil(options.totalItems / options.pageSize);

  return {
    success: true,
    data,
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      totalItems: options.totalItems,
      totalPages,
      hasNextPage: options.page < totalPages,
      hasPreviousPage: options.page > 1,
    },
    meta: buildResponseMeta(options),
  };
};
