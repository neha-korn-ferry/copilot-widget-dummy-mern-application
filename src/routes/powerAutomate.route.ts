import { Router } from "express";
import { connectPowerAutomate } from "../controllers/powerAutomate.controller";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/connect",  asyncHandler(connectPowerAutomate))

export default router;