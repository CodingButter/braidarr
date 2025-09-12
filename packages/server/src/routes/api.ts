import { FastifyInstance } from "fastify";
import { z } from "zod";

// const UserSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   email: z.string().email(),
// })

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Mock data store (replace with real database)
let users = [
  { id: "1", name: "Demo User", email: "demo@braidarr.com" },
  { id: "2", name: "Admin User", email: "admin@braidarr.com" },
];

export async function apiRoutes(fastify: FastifyInstance) {
  // Users routes
  fastify.get(
    "/users",
    {
      schema: {
        description: "Get all users",
        tags: ["users"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      return users;
    },
  );

  fastify.get<{ Params: { id: string } }>(
    "/users/:id",
    {
      schema: {
        description: "Get user by ID",
        tags: ["users"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = users.find((u) => u.id === id);

      if (!user) {
        return reply.status(404).send({
          error: "Not Found",
          message: "User not found",
        });
      }

      return user;
    },
  );

  fastify.post<{ Body: z.infer<typeof CreateUserSchema> }>(
    "/users",
    {
      schema: {
        description: "Create a new user",
        tags: ["users"],
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
          },
          required: ["name", "email"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const validatedData = CreateUserSchema.parse(request.body);

      const newUser = {
        id: String(users.length + 1),
        ...validatedData,
      };

      users.push(newUser);

      return reply.status(201).send(newUser);
    },
  );

  // Media routes (placeholder)
  fastify.get(
    "/media",
    {
      schema: {
        description: "Get media items",
        tags: ["media"],
        response: {
          200: {
            type: "object",
            properties: {
              items: { type: "array" },
              total: { type: "number" },
              page: { type: "number" },
              pageSize: { type: "number" },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      return {
        items: [], // Placeholder for media items
        total: 0,
        page: 1,
        pageSize: 20,
      };
    },
  );
}
