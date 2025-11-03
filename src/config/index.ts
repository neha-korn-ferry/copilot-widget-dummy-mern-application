import dotenv from "dotenv";

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== "production";
const isTest = process.env.NODE_ENV === "test";

// Default values for development
const defaultValues = {
  PORT: 4000,
  NODE_ENV: "development",
  JWT_SECRET: isDevelopment ? "demo-secret-key-change-in-production" : undefined,
  CLIENT_ORIGIN: "http://localhost:3000",
  DIRECT_LINE_TOKEN_ENDPOINT: "",
};

// Environment variable validation (strict for production)
if (!isTest && !isDevelopment) {
  const requiredEnvVars = ["JWT_SECRET", "CLIENT_ORIGIN"] as const;
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

const corsOrigin =
  isDevelopment
    ? process.env.CLIENT_ORIGIN || defaultValues.CLIENT_ORIGIN
    : process.env.CLIENT_ORIGIN!;

export const config = {
  port: Number(process.env.PORT || defaultValues.PORT),
  nodeEnv: process.env.NODE_ENV || defaultValues.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET || defaultValues.JWT_SECRET!,
  clientOrigin: corsOrigin,
  directLineTokenEndpoint:
    process.env.DIRECT_LINE_TOKEN_ENDPOINT || defaultValues.DIRECT_LINE_TOKEN_ENDPOINT,
  cors: {
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] as string[],
    allowedHeaders: ["Content-Type", "Authorization"] as string[],
  },
};

