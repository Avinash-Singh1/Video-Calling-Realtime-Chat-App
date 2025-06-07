import express from "express";
import { login, logout, onboard, Singup } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router =express.Router();

router.post("/signup",Singup);
router.post("/login",login);
router.post("/logout",logout);

router.post("/onboarding",protectRoute,onboard);

export default router;