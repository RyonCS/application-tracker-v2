import passport from 'passport';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
dotenv.config();

const prisma = new PrismaClient();

// Renders the login page when a user navigates to the login route.
export const getLoginPage = (req: Request, res: Response) => {
  res.render('login');
};

// Renders the register page when a user navigates to the register route.
export const getRegisterPage = (req: Request, res: Response) => {
  res.render('register');
};

/**
 * Handles user login when username and password are provided.
 *
 * 1. Uses Passport's "local" strategy to authenticate the user.
 * 2. If authentication fails or errors occur, redirects back to the login page.
 * 3. If authentication succeeds, logs the user in using `req.login`.
 * 4. Handles any login errors and redirects back to login if needed.
 * 5. On successful login, redirects the user to their applications dashboard.
 * @param req - Express request object containing user credentials in req.body.
 * @param res - Express response object used to redirect or respond to the client
 * @returns Redirects the user either to the applications dashboard on success,
 *          or back to the login page on failure or error.
 */
export const login = async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });
  }

  try {
    // Authenticate user using Passport's local strategy.
    passport.authenticate('local', (err: Error, authenticatedUser: any) => {
      if (err || !authenticatedUser) {
        console.log('Failed to authenticate user.');
        return res.redirect('/auth/login'); // Redirect on error or failure.
      }

      // Log in the authenticated user (establish session).
      req.login(authenticatedUser, (err: Error) => {
        if (err) {
          console.log('Failed to log in.');
          return res.redirect('/auth/login'); // Redirect if login error.
        }
        return res.redirect('/applications/my-applications'); // Redirect on success.
      });
    })(req, res); // Immediately invoke the passport middleware with req, res.
  } catch (err) {
    console.log('Error during login process:', err);
    return res.redirect('/auth/login'); // Redirect on unexpected errors.
  }
};

/**
 * Registers a new user by creating an account with email and password.
 * @param req - Express request object containing user registration data in req.body.
 * @param res - Express response object used to redirect the client.
 * @returns - Redirects the user to the applications dashboard on successful registration,
 *            or back to the login page if the email is already in use or on error.
 */
export const register = async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });
  }

  const { emailAddress, password } = req.body;
  try {
    // Check if a user with the same email already exists.
    const existingUser = await prisma.user.findUnique({
      where: { emailAddress },
    });

    // Redirect to login page if email is already registered.
    if (existingUser) {
      console.log('Existing user found.');
      return res.redirect('/auth/login');
    }

    // Hash the plain-text password before storing it.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database.
    const newUser = await prisma.user.create({
      data: {
        emailAddress,
        passwordHash: hashedPassword,
      },
    });
    console.log("New User Created. Email: ", emailAddress, "HashedPass: ", hashedPassword);

    req.login(newUser, (err) => {
      if (err) {
        console.log('Login error after registration:', err);
        return res.redirect('/auth/login');
      }
      return res.redirect('/applications/my-applications');
    });

  } catch (err) {
    console.log('Error', err);
    // Redirect back to login page on error.
    return res.redirect('/auth/login');
  }
};

/**
 * Logs out the user by calling Passport's logout method and destroying the session.
 *
 * @param req - Express request object containing the user's session and Passport methods
 * @param res - Express response object used to send redirects or error responses
 * @returns Redirects to the login page after successful logout,
 *          or sends a 500 error if session destruction fails
 */
export const logOut = (req: Request, res: Response) => {
  // Call Passport's logout to remove user info from the session.
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Could not log out.");
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error", err);
        return res.status(500).send("Could not log out.");
      }

      res.redirect('/auth/login');
    });
  });
};
