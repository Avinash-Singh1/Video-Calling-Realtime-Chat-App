import { protectRoute } from "../middleware/auth.middleware";
import express from express;
import { getMyFriends, getRecommendedUsers } from "../controllers/user.controller";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/",getRecommendedUsers);
router.get("/friends",getMyFriends);
router.get("/friends-request/:id",sendFriendRequest);
router.get("/friends-request/:id/accept",sendFriendRequest);

export default router;