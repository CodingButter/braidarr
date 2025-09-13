import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import compress from "@fastify/compress";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cookie from "@fastify/cookie";
import { healthRoutes } from "./routes/health.js";
import { apiRoutes } from "./routes/api.js";
import { authRoutes } from "./routes/auth.js";
import { plexRoutes } from "./routes/plex/index.js";
import { apiKeyRoutes } from "./routes/api-keys.js";
import { settingsRoutes } from "./routes/settings.js";
import { indexerRoutes } from "./routes/indexer.routes.js";
import { csrfPlugin } from "./middleware/csrf.js";
import { rateLimitPlugin } from "./middleware/rate-limit.js";

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
});

// Register plugins
await server.register(helmet, {
  contentSecurityPolicy: process.env.NODE_ENV === "production",
});
await server.register(compress);

// Cookie support (required for CSRF and refresh tokens)
await server.register(cookie, {
  secret: process.env.COOKIE_SECRET || "dev-cookie-secret-change-in-production",
});

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ["http://localhost:3100", "http://localhost:3101"];

await server.register(cors, {
  origin: corsOrigins,
  credentials: true,
});

// Global rate limiting
await server.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  timeWindow: process.env.RATE_LIMIT_WINDOW || "1 minute",
});

// CSRF protection
await server.register(csrfPlugin);

// Route-specific rate limiting
await server.register(rateLimitPlugin);

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
await server.register(authRoutes, { prefix: "/api/v1/auth" });
await server.register(apiRoutes, { prefix: "/api/v1" });
await server.register(plexRoutes, { prefix: "/api/v1/plex" });
await server.register(apiKeyRoutes, { prefix: "/api/v1/api-keys" });
await server.register(settingsRoutes, { prefix: "/api/v1/settings" });

// Arr ecosystem routes
await server.register(indexerRoutes, { prefix: "/api/v1/indexer" });

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
