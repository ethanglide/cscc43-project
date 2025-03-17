import express from "express";
import authenticate from "../middleware/authenticate";
import FriendsController from "../controllers/friends-controller";
import FriendsValidator from "../middleware/friends-validator";

const router = express.Router();

router.get("/", FriendsValidator.getFriends, FriendsController.getFriends);

router.get("/incoming", authenticate, FriendsController.getIncomingRequests);

router.get("/outgoing", authenticate, FriendsController.getOutgoingRequests);

router.post(
  "/send",
  authenticate,
  FriendsValidator.sendFriendRequest,
  FriendsController.sendFriendRequest,
);

router.post(
  "/accept",
  authenticate,
  FriendsValidator.acceptFriendRequest,
  FriendsController.acceptFriendRequest,
);

router.post(
  "/reject",
  authenticate,
  FriendsValidator.rejectFriendRequest,
  FriendsController.rejectFriendRequest,
);

router.post(
  "/delete",
  authenticate,
  FriendsValidator.deleteFriendRequest,
  FriendsController.deleteFriendRequest,
);

export default router;
