import { z } from "zod";

// User types
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  role: z.enum(["admin", "user"]).default("user"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// API Response types
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    timestamp: z.string().datetime(),
  });

export const PaginationSchema = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(100),
  total: z.number(),
  totalPages: z.number(),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  });

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
};

export type Pagination = z.infer<typeof PaginationSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

// Media types (placeholder for future implementation)
export const MediaItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["movie", "tv", "music", "book"]),
  path: z.string(),
  size: z.number(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;

// Configuration types
export const AppConfigSchema = z.object({
  version: z.string(),
  environment: z.enum(["development", "staging", "production"]),
  api: z.object({
    host: z.string(),
    port: z.number(),
    cors: z.object({
      origin: z.array(z.string()),
      credentials: z.boolean(),
    }),
  }),
  database: z
    .object({
      url: z.string(),
      ssl: z.boolean().optional(),
    })
    .optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}
