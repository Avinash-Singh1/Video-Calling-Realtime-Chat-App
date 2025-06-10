import { protectRoute } from "../middleware/auth.middleware";
import express from express;
import { acceptFriendRequest, getFriendRequests, getMyFriends, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/",getRecommendedUsers);
router.get("/friends",getMyFriends);
router.post("/friends-request/:id",sendFriendRequest);
router.put("/friends-request/:id/accept",acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

export default router;