import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { AuthContext, DemoUser } from "./types";

const JWT_SECRET = process.env.JWT_SECRET ?? "demo-secret";
const DEMO_SESSION_ID = "demo-session-id";
const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour

const sessionStore = new Map<string, { user: DemoUser; expiresAt: number }>();

export const demoUser: DemoUser = {
  id: "participant-001",
  name: "Neha Tanwar",
  email: "neha.tanwar@kornferry.com",
};

export const VALID_CREDENTIALS = {
  email: "neha.tanwar@kornferry.com",
  password: "Neha@123",
};

export const issueSession = () => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessionStore.set(DEMO_SESSION_ID, { user: demoUser, expiresAt });
  return { id: DEMO_SESSION_ID, expiresAt };
};

export const issueToken = () =>
  jwt.sign(
    {
      ...demoUser,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

const decodeToken = (token: string): AuthContext | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

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

const readSession = (sessionId: string | undefined): AuthContext | null => {
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

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  const tokenContext = bearerToken ? decodeToken(bearerToken) : null;
  if (tokenContext) {
    (req as Request & { auth?: AuthContext }).auth = tokenContext;
    return next();
  }

  const sessionId = req.cookies?.sessionId as string | undefined;
  const sessionContext = readSession(sessionId);

  if (sessionContext) {
    (req as Request & { auth?: AuthContext }).auth = sessionContext;
    return next();
  }

  res.status(401).json({
    error: "Unauthorized",
    detail: "Provide a valid Bearer token or active session cookie.",
  });
};

export const attachAuthContext = (req: Request): AuthContext | undefined =>
  (req as Request & { auth?: AuthContext }).auth;

