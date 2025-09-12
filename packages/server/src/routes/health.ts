import { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint",
        tags: ["health"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
              uptime: { type: "number" },
              version: { type: "string" },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "0.0.1",
      };
    },
  );

  fastify.get("/ready", async (_request, _reply) => {
    // Add readiness checks here (database connections, etc.)
    return { status: "ready" };
  });
}
