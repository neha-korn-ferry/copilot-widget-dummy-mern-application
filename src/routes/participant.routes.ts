import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate } from "../middleware/auth.middleware";
import { getParticipantSummary } from "../controllers/participant.controller";
import { connectPowerAutomate } from "../controllers/powerAutomate.controller";

const router = Router();

router.get("/participant-summary", authenticate, asyncHandler(getParticipantSummary));
router.get("/connect-power-automate", authenticate, asyncHandler(connectPowerAutomate));

export default router;

