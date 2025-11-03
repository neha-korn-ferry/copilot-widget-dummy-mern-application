import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  signInWithCookie,
  signInWithToken,
  getSession,
  signOut,
} from "../controllers/auth.controller";

const router = Router();

router.post("/sign-in-cookie", asyncHandler(signInWithCookie));
router.post("/sign-in-token", asyncHandler(signInWithToken));
router.get("/session", asyncHandler(getSession));
router.post("/sign-out", asyncHandler(signOut));

export default router;

