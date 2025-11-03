import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import { AuthContext, DemoUser, SessionData } from "../types/interfaces";

const DEMO_SESSION_ID_PREFIX = "demo-session-";
const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour
const SESSION_CLEANUP_INTERVAL_MS = 1000 * 60 * 15; // 15 minutes

const sessionStore = new Map<string, SessionData>();

export const demoUser: DemoUser = {
  id: "participant-001",
  name: "Neha Tanwar",
  email: "neha.tanwar@kornferry.com",
};

export const VALID_CREDENTIALS = {
  email: "neha.tanwar@kornferry.com",
  password: "Neha@123",
};

// Periodic cleanup of expired sessions
const cleanupExpiredSessions = (): void => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0 && config.nodeEnv === "development") {
    console.log(`Cleaned up ${cleanedCount} expired session(s)`);
  }
};

// Run cleanup periodically
setInterval(cleanupExpiredSessions, SESSION_CLEANUP_INTERVAL_MS);

// Cleanup on startup
cleanupExpiredSessions();

export const issueSession = (): { id: string; expiresAt: number } => {
  const sessionId = `${DEMO_SESSION_ID_PREFIX}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const createdAt = Date.now();

  sessionStore.set(sessionId, { user: demoUser, expiresAt, createdAt });
  return { id: sessionId, expiresAt };
};

export const issueToken = (): string =>
  jwt.sign(
    {
      ...demoUser,
    },
    config.jwtSecret,
    { expiresIn: "1h" }
  );

export const decodeToken = (token: string): AuthContext | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (typeof decoded === "object" && decoded !== null) {
      const payload = decoded as JwtPayload & DemoUser;
      if (payload.id && payload.name && payload.email) {
        return {
          user: {
            id: String(payload.id),
            name: String(payload.name),
            email: String(payload.email),
          },
          method: "token",
          token,
          expiresAt:
            typeof payload.exp === "number" ? payload.exp * 1000 : undefined,
        };
      }
    }
  } catch (error) {
    return null;
  }

  return null;
};

export const readSession = (sessionId: string | undefined): AuthContext | null => {
  if (!sessionId) {
    return null;
  }

  const stored = sessionStore.get(sessionId);
  if (!stored) {
    return null;
  }

  if (stored.expiresAt < Date.now()) {
    sessionStore.delete(sessionId);
    return null;
  }

  return {
    user: stored.user,
    method: "cookie",
    sessionId,
    expiresAt: stored.expiresAt,
  };
};

export const deleteSession = (sessionId: string | undefined): boolean => {
  if (!sessionId) {
    return false;
  }

  return sessionStore.delete(sessionId);
};

