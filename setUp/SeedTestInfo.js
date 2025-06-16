// Seeds.js - Responsible for seeding database with Users and Applications for testing.
import User from "../models/User.js";
import Application from "../models/Application.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Connecting to MongoDB to seed data.
dotenv.config();
const dbURI = process.env.MONGO_URI;
mongoose
  .connect(dbURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.log("Error: ", err);
  });

// Adds test users to the database.
const seedUsers = async () => {
  try {
    // An array of User Objects.
    const testUsers = [
      {
        _id: new mongoose.Types.ObjectId(),
        emailAddress: "TestUser1@yahoo.com",
        password: "TestUser1Password",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        emailAddress: "TestUser2@yahoo.com",
        password: "TestUser2Password",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        emailAddress: "TestUser3@yahoo.com",
        password: "TestUser3Password",
      },
    ];

    // Iterate through each User Object to see if it already exists in the database.
    // If it doesn't add it, if it does, console.log.
    for (const userData of testUsers) {
      // Find duplictae users based on unique email address.
      const foundUser = await User.findOne({
        emailAddress: userData.emailAddress,
      });

      // If no user with email address found, add the user to the db.
      if (!foundUser) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`Added new user: ${userData.emailAddress}`);
      } else {
        console.log(`ERROR: ${userData.emailAddress} already exists.`);
      }
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Adds test applications to the database.
const seedApplications = async () => {
  try {
    // An array of test Application Objects.
    const testApplications = [
      // User1 Applications.
      {
        _id: new mongoose.Types.ObjectId(),
        company: "Amazon",
        position: "Junior SWE",
        location: "San Francisco, CA",
        status: "Applied",
        userId: new mongoose.Types.ObjectId("67f02ba8e024e20e6705746b"),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        company: "Google",
        position: "Entry Level SWE",
        location: "Remote",
        status: "Applied",
        userId: new mongoose.Types.ObjectId("67f02ba8e024e20e6705746b"),
      },
      // User2Applications.
      {
        _id: new mongoose.Types.ObjectId(),
        company: "Barnes and Noble",
        position: "Front Desk Clerk",
        location: "Unknown",
        status: "Rejected",
        userId: new mongoose.Types.ObjectId("67f02ba8e024e20e6705746c"),
      },
    ];

    // Iterate through each Application Object to see if it already exists in the database.
    // If it doesn't add it, if it does, console.log.
    for (const applicationData of testApplications) {
      const foundApplication = await Application.findOne({
        company: applicationData.company,
        position: applicationData.position,
        userId: applicationData.userId,
      });

      // If no dulicate application, add application to db.
      if (!foundApplication) {
        const newApplication = new Application(applicationData);
        await newApplication.save();
        console.log(`Added new application: ${applicationData.company}`);
      } else {
        console.log(
          `ERROR: ${applicationData.position} at ${applicationData.company} already exists.`,
        );
      }
    }
  } catch (error) {
    console.log("Error: ", error);
  }
};

// Function to seed users and applications.
const seedDatabase = async () => {
  await seedUsers();
  await seedApplications();
  mongoose.disconnect();
};

// Delete Previous MongoDB data
await Application.deleteMany({});
await User.deleteMany({});

// Seeding here.
seedDatabase();
