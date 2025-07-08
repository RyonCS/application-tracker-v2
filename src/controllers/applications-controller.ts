import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseApplicationQueryParams } from '../utils/queryParser';

const prisma = new PrismaClient();

/**
 * Get's all Job Applications for the logged-in user.
 * @param req - The HTTP request object.
 *              It contains information about the client's request,
 *              including query params, session/user data, headers, etc.
 * @param res - The HTTP response object.
 *              It is used to send a response back to the client,
 *              including rendering views, sending JSON, and redirects.
 * @returns Renders the "my-application" page with the users job applications,
 *          or redirects to login if the user is not authenticated.
 */
export const getAllApplications = async (req: Request, res: Response) => {
  // Get the user's ID from the session.
  const userId = req.user?.id;

  // If no user is logged in, redirect to login page.
  if (!userId) {
    return res.redirect('/auth/login');
  }

  // Parse sorting, filtering, and searching options from the query parameters.
  const { where, orderBy, sort, filter, search } = parseApplicationQueryParams(
    req.query,
    userId,
  );

  // Query the database for all matching job applications belonging to the user.
  const applications = await prisma.jobApplication.findMany({
    where,
    orderBy,
  });

  // Render the EJS view for displaying the user's applications.
  res.render('my-applications', { applications, sort, filter, search });
};

/**
 * Renders the page to create a new job application.
 *
 */
export const newApplicationPage = (req: Request, res: Response) => {
  // Render the form view for adding a new application.
  // Pass the current date to pre-fill the application date input.
  res.render('add-application', { date: new Date() });
};

/**
 * Handles the creation of a new job application for a logged-in user.
 * @param req - Express request object containing form data in req.body and user info in req.user.
 * @param res - Express response object used to redirect the user after the new application is saved.
 */
export const addNewApplication = async (req: Request, res: Response) => {
  // Get the logged-in user's ID from the session (populated by Passport).
  const userId = req.user?.id;

  // Destructure specific fields from the request body.
  const { applicationDate, workMode, status, ...data } = req.body;

  // Convert the submitted application date string into a Date object,
  // or default to the current date if none was provided.
  let parsedDate = new Date();
  if (applicationDate) {
    const now = new Date();
    const [year, month, day] = applicationDate.split('-').map(Number);
    parsedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  }

  /**
   * Normalizes enum values like `workMode` and `status` by:
   * - Converting to uppercase
   * - Removing dashes and whitespace
   * Example: "in-office" => "INOFFICE"
   */
  const normalizeEnum = (value: string | undefined) =>
    value?.toUpperCase().replace(/[-\s]/g, '');

  // Create a new job application record in the database.
  await prisma.jobApplication.create({
    data: {
      ...data, // Include all other form fields (e.g., company, position, location).
      applicationDate: parsedDate,
      userId,
      workMode: normalizeEnum(workMode),
      status: normalizeEnum(status),
    },
  });

  res.redirect('/applications/my-applications');
};

/**
 * Renders the edit page for a specific job application.
 */
export const editApplicationPage = async (req: Request, res: Response) => {
  // Get the logged-in user's ID from the session.
  const userId = req.user?.id;

  // Extract the application ID from the route parameters (e.g., /applications/:id/edit).
  const applicationId = req.params.id;

  // Query the database for the specific job application.
  const application = await prisma.jobApplication.findUnique({
    where: {
      id: applicationId,
    },
  });

  // If the application doesn't exist, or doesn't belong to the logged-in user,
  // redirect to the dashboard to prevent unauthorized access.
  if (!application || application.userId !== userId) {
    return res.redirect('/applications/my-applications');
  }

  // If all checks pass, render the edit form with the application data.
  res.render('edit-application', { application });
};

/**
 * Handles editing an existing job application by ID.
 * - Verifies the application exists and belongs to the currently logged-in user.
 * - Updates the application with values from the request body.
 * - Redirects to the applications dashboard in all cases (success or unauthorized).
 *
 * @param req - Express request object containing the application ID in req.params,
 *              user session data in req.user, and updated form data in req.body.
 * @param res - Express response object used to redirect after update or on error.
 * @returns Redirects to "/applications/my-applications"
 */
export const editApplication = async (req: Request, res: Response) => {
  // Get current user's ID from session (via Passport)
  const userId = req.user?.id;

  // Get application ID from route parameters.
  const { id } = req.params;

  // Look up the existing application by its ID.
  const application = await prisma.jobApplication.findUnique({ where: { id } });

  // Extract fields from the request body.
  const { applicationDate, workMode, status } = req.body;

  // Parse and normalize date.
  const parsedDate = applicationDate ? new Date(applicationDate) : new Date();

  /**
   * Utility to normalize enums (workMode, status)
   * Converts strings to uppercase and strips whitespace or dashes.
   * Example: "in-office" → "INOFFICE"
   */
  const normalizeEnum = (value: string | undefined) =>
    value?.toUpperCase().replace(/[-\s]/g, '');

  // If the application does not exist or does not belong to the current user,
  // prevent unauthorized access by redirecting back to the dashboard.
  if (!application || application.userId !== userId) {
    return res.redirect('/applications/my-applications');
  }

  // Update the application with the new data.
  await prisma.jobApplication.update({
    where: { id },
    data: {
      ...req.body,
      applicationDate: parsedDate,
      workMode: normalizeEnum(workMode),
      status: normalizeEnum(status),
    },
  });

  // Redirect back to the user's applications dashboard after update.
  res.redirect('/applications/my-applications');
};

/**
 * Deletes a specific job application by its ID.
 *
 * @param req - Express request object containing the application ID in the route parameters
 * @param res - Express response object used to redirect the user after deletion
 * @returns Redirects the user to the applications dashboard after deletion
 */
export const deleteApplication = async (req: Request, res: Response) => {
  // Extract the application ID from the route parameters.
  const { id } = req.params;

  const userId = req.user?.id;

  // Look up the application in the database.
  const application = await prisma.jobApplication.findUnique({
    where: { id },
  });

  // If application doesn't exist or doesn't belong to the logged-in user, deny access.
  if (!application || application.userId !== userId) {
    return res.redirect('/applications/my-applications');
  }

  // If everything checks out, delete the application.
  await prisma.jobApplication.delete({ where: { id } });

  // Redirect to the dashboard after deletion.
  res.redirect('/applications/my-applications');
};
