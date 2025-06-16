import express from "express";

const router = express.Router();

import {
  getAllApplications,
  newApplicationPage,
  addNewApplication,
  editApplicationPage,
  editApplication,
  deleteApplication,
} from "../controllers/applications-controller";

// Simple Get Route to render the homepage.
router.get("/my-applications", getAllApplications);

// Route to new application page.
router.get("/new", newApplicationPage);

// Route to edit application page.
router.get("/my-applications/:_id/edit", editApplicationPage);

// Route to add a new application.
router.post("/my-applications", addNewApplication);

// Route to edit a specific application.
router.put("/my-applications/:_id", editApplication);

// Route to delete a specific application.
router.delete("/my-applications/:_id", deleteApplication);

export default router;
