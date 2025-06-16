import express from "express";

const router = express.Router();

import {
  getAllApplications,
  newApplicationPage,
  addNewApplication,
  editApplicationPage,
  editApplication,
  deleteApplication,
} from "../controllers/applications-controller.js";

// Simple Get Route to render the homepage.
router.get("/myApplications", getAllApplications);

// Route to new application page.
router.get("/new", newApplicationPage);

// Route to edit application page.
router.get("/myApplications/:_id/edit", editApplicationPage);

// Route to add a new application.
router.post("/myApplications", addNewApplication);

// Route to edit a specific application.
router.put("/myApplications/:_id", editApplication);

// Route to delete a specific application.
router.delete("/myApplications/:_id", deleteApplication);

export default router;
