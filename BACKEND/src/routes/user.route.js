import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getNotificationCount,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  updateProfile,
  getUserById,
} from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { profileUpdateSchema } from "../validators/auth.validator.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/notification-count", getNotificationCount);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.patch("/profile", validate(profileUpdateSchema), updateProfile);

router.get("/:id", getUserById);

export default router;
