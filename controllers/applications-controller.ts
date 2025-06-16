import Application from "../models/Application.js";
import mongoose from "mongoose";
import { Request, Response } from 'express';

interface ApplicationQueryParams {
  sort?: 'dateAsc' | 'dateDesc' | 'locationAsc' | 'locationDesc';
  filter?: 'excludeRejected';
  searchByCompany?: string;
}

interface ParsedQueryResults {
  query: Record<string, any>;
  sortOption: Record<string, 1 | -1>;
  sort?: string;
  filter?: string;
  search?: string;
}

interface ApplicationQuery {
  userId: string;
  status?: { $ne: string };
  company?: { $regex: RegExp };
}

function parseApplicationQueryParams(queryParams: ApplicationQueryParams, userId: string): ParsedQueryResults {
  const sortMap: Record<NonNullable<ApplicationQueryParams['sort']>, Record<string, -1 | 1>>  = {
    dateAsc: { date: 1 },
    dateDesc: { date: -1 },
    locationAsc: { location: 1 },
    locationDesc: { location: -1 },
  };

  const sort = queryParams.sort ?? 'dateDesc';
  const filter = queryParams.filter;
  const search = queryParams.searchByCompany;
  const sortOption = sortMap[sort] || { date: -1 };

  const query: ApplicationQuery = { userId };

  if (filter === "excludeRejected") {
    query.status = { $ne: "Rejected" };
  }

  if (search) {
    query.company = { $regex: new RegExp(search, "i") };
  }

  return { query, sortOption, sort, filter, search };
}

// Get and display all of the user's applications.
export const getAllApplications = async (req: Request, res: Response) => {
  // Get the current session ID - userID.
  // @ts-ignore
  const loggedInUserID = req.session.user_id;
  // If session ID isnt found, redirect to login.
  if (!loggedInUserID) {
    return res.redirect("/auth/login");
  }

  const { query, sortOption, sort, filter, search } = parseApplicationQueryParams(
    req.query,
    loggedInUserID,
  );

  const userApplications = await Application.find(query).sort(sortOption);
  res.render("myApplications", { userApplications, sort, filter, search });
};

// Display the new Application Page.
export const newApplicationPage = (req: Request, res: Response) => {
  const date = new Date();
  res.render("addApplication", {date});
};

// Add a new application.
export const addNewApplication = async (req: Request, res: Response) => {
  // Create application and get userId from session.
  // @ts-ignore
  const loggedInUserID = req.session.user_id;
  const loggedInUserIDObject = new mongoose.Types.ObjectId(loggedInUserID);

  // Add in time to date for better filtering.
  if (req.body.date) {
    const [year, month, day] = req.body.date.split("-");
    const now = new Date();

    req.body.date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    );
  } else {
    req.body.date = new Date();
  }

  // Create a new application.
  const newApplicationData = {
    ...req.body,
    userId: loggedInUserIDObject,
  };

  const newApplication = new Application(newApplicationData);
  await newApplication.save();

  res.redirect("/applications/myApplications");
};

// Display edit application page.
export const editApplicationPage = async (req: Request, res: Response) => {
  const applicationId = req.params._id;
  // @ts-ignore
  const userId = req.session.user_id;

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.redirect("/applications/myApplications");
    }

    if (!application.userId.equals(userId)) {
      return res.redirect("/applications/myApplications");
    }

    res.render("editApplication", { application });
  } catch (err) {
    return res.redirect("/applications/myApplications");
  }
};

/**
 * Handles editing a application by ID.
 * 
 * Check if the application exists and belongs to the logged-in user, then updates it with the request body.
 * Redirect to "/applications/myApplications" in all cases.
 * @param req 
 * @param res 
 */
export const editApplication = async (req: Request, res: Response) => {
  // Get the id for the application and update it.
  const applicationId = req.params._id;
  // @ts-ignore
  const userId = req.session.user_id;

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      res.redirect("/applications/myApplications");
    }
    console.log("Application from DB:", application);
    if (!application.userId.equals(userId)) {
      res.redirect("/applications/myApplications");
    }
    await Application.findByIdAndUpdate(applicationId, req.body, { runValidators: true });

    res.redirect("/applications/myApplications");
  } catch (err) {
    console.error(err);
    res.redirect("/applications/myApplications");
  }
};

// Delete a application.
export const deleteApplication = async (req: Request, res: Response) => {
  // Get the id for the application and delete it.
  const { _id } = req.params;
  await Application.findByIdAndDelete(_id);
  res.redirect("/applications/myApplications");
};
