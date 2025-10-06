import { Router, Response } from "express";

import { authenticate, attachAuthContext } from "../auth";

const router = Router();

router.get("/participant-summary", authenticate, (req, res: Response) => {
  const auth = attachAuthContext(req);

  if (!auth) {
    return res.status(500).json({
      error: "Auth context missing",
    });
  }

  return res.json({
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
});

export default router;

