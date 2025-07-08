import express from 'express';
import { ensureAuthenticated } from '../middleware/security-middleware';
import rateLimit from 'express-rate-limit';
import {
  getAllApplications,
  newApplicationPage,
  addNewApplication,
  editApplicationPage,
  editApplication,
  deleteApplication,
} from '../controllers/applications-controller';

const router = express.Router();
router.use(ensureAuthenticated);

const addApplicationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // limit each IP to 5 submissions per minute
  message: 'Too many job applications submitted, please try again later.',
});

/**
 * -- Application Routes --
 * This router handles all routes related to managing job applications:
 * - Listing all applications
 * - Adding a new application
 * - Editing or deleting existing applications
 *
 * These routes are used for server-side rendered pages with form submissions.
 */

/**
 * GET /applications/my-applications
 * Renders a page displaying all job applications for the logged-in user.
 */
router.get('/my-applications', getAllApplications);

/**
 * GET /applications/new
 * Renders the "New Application" form where a user can input job details.
 */
router.get('/new', newApplicationPage);

/**
 * GET /applications/my-applications/:id/edit
 * Renders the "Edit Application" page for a specific application ID.
 */
router.get('/my-applications/:id/edit', editApplicationPage);

/**
 * POST /applications/my-applications
 * Handles form submission for adding a new job application.
 * Saves the new application to the database.
 */
router.post('/my-applications', addApplicationLimiter, addNewApplication);

/**
 * PUT /applications/my-applications/:id
 * Handles submission of edits to an existing application.
 * Updates the application data in the database.
 */
router.put('/my-applications/:id', editApplication);

/**
 * DELETE /applications/my-applications/:id
 * Deletes a specific job application by ID from the database.
 */
router.delete('/my-applications/:id', deleteApplication);

export default router;
