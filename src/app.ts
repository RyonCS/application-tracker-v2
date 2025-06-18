
import dotenv from "dotenv";
import path from "path";
import methodOverride from "method-override";
import applicationsRoutes from "./routes/applications-routes";
import authRoutes from "./routes/auth-routes";
import session from "express-session";
import passport from "passport";
import express, { Request, Response } from 'express';
import pg from "pg";
import pgSession from "connect-pg-simple";
import { PrismaClient } from '@prisma/client';
import { initializePassport } from './middleware/passport-config';
dotenv.config();

// Starting up express app.
const app = express();
const prisma = new PrismaClient();
const PgSession = pgSession(session);

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

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Express-session configuration.
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not defined in the environment variables");
}

const isProduction = process.env.NODE_ENV === 'production';

const sessionConfig = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new PgSession({
    pool: pgPool,
    tableName: "session",
  }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};

// Set up session and passport.
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

initializePassport();

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
