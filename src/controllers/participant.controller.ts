import { Request, Response } from "express";
import { CustomError } from "../middleware/errorHandler";
import { attachAuthContext } from "../middleware/auth.middleware";

export const getParticipantSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const auth = attachAuthContext(req);

  if (!auth) {
    throw new CustomError("Auth context missing", 500);
  }

  res.json({
    participantId: auth.user.id,
    participantName: auth.user.name,
    email: auth.user.email,
    authenticatedVia: auth.method,
    expiresAt: auth.expiresAt,
    summary: {
      totalEvents: 5,
      attendedSessions: 4,
      score: 87,
    },
  });
};

