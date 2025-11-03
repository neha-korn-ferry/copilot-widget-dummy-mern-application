import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate } from "../middleware/auth.middleware";
import { getParticipantSummary } from "../controllers/participant.controller";

const router = Router();

router.get("/participant-summary", authenticate, asyncHandler(getParticipantSummary));

export default router;

