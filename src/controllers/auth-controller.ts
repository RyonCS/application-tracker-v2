import User from "../models/User.ts";
import passport from "passport";
import dotenv from "dotenv";
import { Request, Response } from 'express';
dotenv.config();

// Display the login page.
export const getLoginPage = (req: Request, res: Response) => {
  res.render("login");
};

// Display the register page.
export const getRegisterPage = (req: Request, res: Response) => {
  res.render("register");
};

// Login function once user types in username and password.
export const login = async (req: Request, res: Response) => {
  try {
    // Define passport authenticate without custom callback.
    passport.authenticate("local", (err: Error, authenticatedUser: any) => {
      if (err || !authenticatedUser) {
        return res.redirect("/auth/login"); // Redirect on error or authentication failure.
      }
      // @ts-ignore
      req.login(authenticatedUser, (err: Error) => {
        if (err) {
          return res.redirect("/auth/login"); // Redirect if there’s an error logging in.
        }
        // @ts-ignore
        req.session.user_id = authenticatedUser._id; // Save user ID in session.
        return res.redirect("/applications/my-applications"); // Redirect to the user's application page.
      });
    })(req, res); // Trigger passport authentication.
  } catch (err) {
    console.log("Error during login process:", err);
    return res.redirect("/auth/login");
  }
};

// Register a new user.
export const register = async (req: Request, res: Response) => {
  const { emailAddress, password } = req.body;
  try {
    // Check if the email is already used by another user.
    const foundUser = await User.findOne({ emailAddress });
    // Change later.
    if (foundUser) return res.redirect("/auth/login");

    // Create a new user and set sessionID to userId.
    const newUser = new User({ emailAddress });
    await User.register(newUser, password);
    await newUser.save();
    // @ts-ignore
    req.session.user_id = newUser._id;

    return res.redirect("/applications/my-applications");
  } catch (err) {
    return res.redirect("/auth/login");
  }
};

// Logout by destroying session and rerouting to login.
export const logOut = (req: Request, res: Response) => {
  // @ts-ignore
  req.session.destroy();
  return res.redirect("/auth/login");
};
