import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createCallRecord,
  getCallHistory,
  getMissedCallCount,
  getStreamToken,
  markCallsSeen,
} from "../controllers/chat.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCallSchema } from "../validators/chat.validator.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.get("/calls", protectRoute, getCallHistory);
router.get("/calls/missed-count", protectRoute, getMissedCallCount);
router.post("/calls", protectRoute, validate(createCallSchema), createCallRecord);
router.put("/calls/seen", protectRoute, markCallsSeen);

export default router;
