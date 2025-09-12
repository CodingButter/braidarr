import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import compress from "@fastify/compress";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { healthRoutes } from "./routes/health.js";
import { apiRoutes } from "./routes/api.js";

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
});

// Register plugins
await server.register(helmet);
await server.register(compress);
await server.register(cors, {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://your-domain.com"]
      : ["http://localhost:3400", "http://localhost:3000"],
  credentials: true,
});

await server.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Swagger documentation
await server.register(swagger, {
  swagger: {
    info: {
      title: "Braidarr API",
      description: "AI-powered media management API",
      version: "0.0.1",
    },
    host: `localhost:${process.env.PORT || 3401}`,
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
});

await server.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});

// Register routes
await server.register(healthRoutes);
await server.register(apiRoutes, { prefix: "/api/v1" });

// Global error handler
server.setErrorHandler((error, _request, reply) => {
  server.log.error(error);

  if (error.validation) {
    reply.status(400).send({
      error: "Validation Error",
      message: error.message,
      details: error.validation,
    });
    return;
  }

  reply.status(500).send({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
  });
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3401;
    const host = process.env.HOST || "localhost";

    await server.listen({ port, host });
    console.log(`🚀 Braidarr API server running at http://${host}:${port}`);
    console.log(`📚 API Documentation: http://${host}:${port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    await server.close();
    console.log("🛑 Server shutting down gracefully");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
