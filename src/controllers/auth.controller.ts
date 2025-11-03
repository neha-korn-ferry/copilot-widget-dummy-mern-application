import { Request, Response } from "express";
import { CustomError } from "../middleware/errorHandler";
import { config } from "../config";
import {
  VALID_CREDENTIALS,
  demoUser,
  issueSession,
  issueToken,
} from "../services/auth.service";

interface SignInBody {
  email?: string;
  password?: string;
}

const isProduction = config.nodeEnv === "production";

const credentialsAreValid = ({ email, password }: SignInBody): boolean => {
  if (!email || !password) return false;
  return (
    email.trim() === VALID_CREDENTIALS.email &&
    password === VALID_CREDENTIALS.password
  );
};

export const signInWithCookie = async (
  req: Request<unknown, unknown, SignInBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body ?? {};

  if (!credentialsAreValid({ email, password })) {
    throw new CustomError("Invalid credentials", 401);
  }

  const session = issueSession();

  res
    .cookie("sessionId", session.id, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: session.expiresAt - Date.now(),
      path: "/",
    })
    .json({
      message: "Signed in with cookie",
      user: demoUser,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
};

export const signInWithToken = async (
  req: Request<unknown, unknown, SignInBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body ?? {};

  if (!credentialsAreValid({ email, password })) {
    throw new CustomError("Invalid credentials", 401);
  }

  const token = issueToken();

  res.json({
    message: "Signed in with token",
    token,
    user: demoUser,
  });
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    throw new CustomError("No active session", 401);
  }

  // Issue a new session to extend the existing one
  const session = issueSession();

  res
    .cookie("sessionId", session.id, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: session.expiresAt - Date.now(),
      path: "/",
    })
    .json({
      sessionId: session.id,
      user: demoUser,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
};

export const signOut = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.cookies.sessionId;
  
  // Delete session from store if it exists
  if (sessionId) {
    const { deleteSession } = await import("../services/auth.service");
    deleteSession(sessionId);
  }

  // Clear the cookie by setting it to expire immediately
  res
    .clearCookie("sessionId", {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
    })
    .json({
      message: "Signed out successfully",
    });
};

