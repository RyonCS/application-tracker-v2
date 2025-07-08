import express from 'express';
const router = express.Router();
import {
  login,
  register,
  getLoginPage,
  getRegisterPage,
  logOut,
} from '../controllers/auth-controller';

/**
 * -- Authentication Routes --
 * This router handles all routes related to user authentication:
 * rendering login/register pages, handling form submissions for login/register,
 * and logging out users.
 */

/**
 * GET /auth/login
 * Render the login page where users can enter their credentials.
 */
router.get('/login', getLoginPage);

/**
 * POST /auth/login
 * Handles login form submission:
 * Authenticate user credentials and create a session if successful.
 */
router.post('/login', login);
/**
 * GET /auth/register
 * Render the registration page to allow new users to create an account.
 */
router.get('/register', getRegisterPage);

/**
 * POST /auth/register
 * Handle registration form submission:
 * Create a new user in the database and start a session.
 */
router.post('/register', register);

/**
 * POST /auth/logout
 * Handle logout requests:
 * terminate the user's session and redirect or respond accordingly.
 */
router.post('/logout', logOut);

export default router;
