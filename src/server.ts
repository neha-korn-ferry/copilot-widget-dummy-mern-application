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
import path from "path";

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

// ... saare API routes ke BAAD (Line 31 ke niche) ...

// 1. Static files serve karein
// '__dirname' src ke andar hai, isliye '../' se bahar nikal kar frontend/build mein jayenge
const frontendPath = path.join(__dirname, "../frontend/build"); 
app.use(express.static(frontendPath));

// 2. Catch-all route (Regex use karke)
app.get(/^(?!\/api).+/, (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// 3. Error handler (Sabse last mein)
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