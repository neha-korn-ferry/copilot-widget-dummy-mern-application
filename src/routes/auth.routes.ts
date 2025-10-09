import { Router, Request, Response } from "express";

import {
  VALID_CREDENTIALS,
  demoUser,
  issueSession,
  issueToken,
} from "../auth";

interface SignInBody {
  email?: string;
  password?: string;
}

const router = Router();

const isProduction = process.env.NODE_ENV === "production";

const credentialsAreValid = ({ email, password }: SignInBody): boolean =>
  email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password;

router.post(
  "/sign-in-cookie",
  (req: Request<unknown, unknown, SignInBody>, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!credentialsAreValid({ email, password })) {
      return res.status(401).json({
        error: "Invalid credentials",
        detail: "Email or password is incorrect.",
      });
    }

    const session = issueSession();

    res
      .cookie("sessionId", session.id, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        maxAge: session.expiresAt - Date.now(),
      })
      .json({
        message: "Signed in with cookie",
        user: demoUser,
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
        },
      });
  }
);

router.post(
  "/sign-in-token",
  (req: Request<unknown, unknown, SignInBody>, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!credentialsAreValid({ email, password })) {
      return res.status(401).json({
        error: "Invalid credentials",
        detail: "Email or password is incorrect.",
      });
    }

    const token = issueToken();

    res.json({
      message: "Signed in with token",
      token,
      user: demoUser,
    });
  }
);

router.get(
  "/session",
  (req: Request, res: Response) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) return res.status(401).json({ error: "No session" });
    // Example: return user data based on session ID

    const session = issueSession();

    res.json({
      sessionId, user: demoUser, session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  }
)

export default router;

