import User from "../Models/User.js";
import Application from "../Models/Application.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Connecting to MongoDB to ensure models are added.
dotenv.config();
const dbURI = process.env.MONGO_URI;
mongoose
  .connect(dbURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.log("Error: ", err);
  });

const addModels = async () => {
  try {
    await User.createIndexes();
    await Application.createIndexes();
    console.log("Indexes for User and Application models have been created.");
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Calling the function to ensure models are connected.
addModels().then(() => mongoose.disconnect());
