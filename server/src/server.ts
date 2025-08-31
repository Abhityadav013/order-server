import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { setupSwagger } from "./config/swagger";
import authRoutes from "./user/routes/auth.routes";
import userDetailsRoute from "./user/routes/user-details.route";
import deliveryWebhookRoutes from "./webhook/routes/webhook.routes";
import menuDetailRoute from "./menus/routes/menu.route";
import categoryDetailRoute from "./category/routes/category.route";
import infoRoute from "./info/routes/info.route";
import { errorHandler } from "./middleware/errorHandler";
import { requireDeviceAndTid } from "./middleware/headerValidator";
import cartRoute from "./cart/routes/cart.routes";
import { sessionRouter } from "./session/routes/session.routes";
import { sessionMiddleware } from "./middleware/cookiesHandler";
import cookieParser from "cookie-parser";
import { SessionService } from "./session/service/session.service";
import { SessionRepository } from "./session/service/session.repository";
dotenv.config();

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "https://order.indiantadka.eu/",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4000",
  "https://95b2683ee436.ngrok-free.app",
  "*",
];
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "x-device-id",
    "x-tid",
    "tid",
    "ssid",
  ],
  exposedHeaders: [],
  maxAge: 86400,
};
// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
// app.use(requireDeviceAndTid);

// Swagger
setupSwagger(app);

// Redirect root '/' to Swagger UI
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

app.use("/v1/session", sessionRouter);

const repo = new SessionRepository();
app.use(sessionMiddleware({ repo }));
// Example: routes that might rely on session already being established

// app.use("/api/v1/auth", authRoutes);
app.use("/v1/user-details", requireDeviceAndTid, userDetailsRoute);
app.use("/v1/menu", menuDetailRoute);
app.use("/v1/category", categoryDetailRoute);
app.use("/v1/info", infoRoute);
app.use("/v1/cart", requireDeviceAndTid, cartRoute);
app.use("/webhook", requireDeviceAndTid, deliveryWebhookRoutes);

// Error handler
app.use(errorHandler);


const port = Number(process.env.PORT) || 4000;

async function bootstrap() {
  await connectDB(process.env.MONGO_URI || "");
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
  });
}

bootstrap();
