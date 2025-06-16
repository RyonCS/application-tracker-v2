import express from "express";
import passport from "passport";
const router = express.Router();
import {
  login,
  register,
  getLoginPage,
  getRegisterPage,
  logOut,
} from "../controllers/auth-controller.ts";

// Route to login page.
router.get("/login", getLoginPage);

// Route to login.
router.post("/login", login);

// Route to get register page.
router.get("/register", getRegisterPage);

// Route to register.
router.post("/register", register);

// Route to logout.
router.post("/logout", logOut);

export default router;
