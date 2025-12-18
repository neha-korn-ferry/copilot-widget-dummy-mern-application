import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import authRoutes from "./routes/auth.routes";
import participantRoutes from "./routes/participant.routes";
import powerAutomateRoutes from "./routes/powerAutomate.route"
import { getBotToken } from "./controllers/bot.controller";

const app = express();

// Middleware
app.use(requestLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors(config.cors));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use(participantRoutes);
app.use("/api/power-automate",powerAutomateRoutes);
app.get("/api/bot-token", asyncHandler(getBotToken));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler (must be last)
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`API server listening on port ${config.port} (${config.nodeEnv})`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);