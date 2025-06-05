import express from "express";
import { login, logout, Singup } from "../controllers/auth.controllers.js";

const router =express.Router();

router.post("/signup",Singup);
router.post("/login",login);
router.post("/logout",logout);

export default router;