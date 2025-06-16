import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import methodOverride from "method-override";
import applicationsRoutes from "./routes/applications-routes";
import authRoutes from "./routes/auth-routes";
import session from "express-session";
import passport from "passport";
import localStrategy from "passport-local";
import User from "./models/User.ts";
import MongoStore from "connect-mongo";
import express, { Request, Response } from 'express';
import { fileURLToPath } from "url";
import fs from "fs";
dotenv.config();

// Connecting to MongoDB.
const dbURI: string = process.env.MONGO_URI ?? '';
mongoose
  .connect(dbURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error: ", err));

// Starting up express app.
const app = express();

const viewsPath = path.join(__dirname, "views");

// Set up the views directory
app.set("views", viewsPath);
app.set("view engine", "ejs");

// Middleware setup.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.static(path.join(__dirname, "..", "public")));

// Express-session configuration.
const sessionSecret = process.env.SESSION_SECRET;
const sessionConfig = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: dbURI,
    collectionName: "sessions",
  }),
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// Set up session and passport.
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.use("/applications", applicationsRoutes);
app.use("/auth", authRoutes);

// Home route
app.get("/", (req: Request, res: Response) => {
  res.render("login");
});

const port = process.env.PORT || 3000;

// Running our server.
app.listen(port, () => {
  console.log(`Listening on Port ${port}.`);
});
