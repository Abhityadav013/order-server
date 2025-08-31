import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

export function setupSwagger(app: Express) {
  const options: swaggerJSDoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Auth API",
        version: "1.0.0",
        description: "Authentication API with JWT and Google OAuth"
      },
      servers: [{ url: "/"}]
    },
    apis: ["./src/**/*.ts"]
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
