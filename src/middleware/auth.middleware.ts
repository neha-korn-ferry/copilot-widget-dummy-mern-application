import { Request, Response, NextFunction } from "express";
import { decodeToken, readSession } from "../services/auth.service";
import { AuthContext } from "../types/interfaces";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

