import dotenv from 'dotenv';
import path from 'path';
import methodOverride from 'method-override';
import applicationsRoutes from './routes/applications-routes';
import authRoutes from './routes/auth-routes';
import session from 'express-session';
import passport from 'passport';
import express, { Request, Response } from 'express';
import pg from 'pg';
import pgSession from 'connect-pg-simple';
import rateLimit from 'express-rate-limit';
import { initializePassport } from './middleware/passport-config';

// Load environment variables from .env file.
dotenv.config();

// Create an instance of Express application.
const app = express();
app.set('trust proxy', 1);

// Initialize Postgres session store for Express sessions.
const PgSession = pgSession(session);

// Configure Express to use EJS and set the views directory.
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'ejs');

// -- Middleware Setup: --

// Parse URL-encoded bodies (form submission).
app.use(express.urlencoded({ extended: true }));

// Parse incoming JSON payloads.
app.use(express.json());

// Enable HTTP method override for supporting "PUT/DELETE" in forms.
app.use(methodOverride('_method'));

// Serve static files like CSS, JS, and images from 'public' directory.
app.use(express.static(path.join(__dirname, '..', 'public')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many attempts from this IP, please try again after 15 minutes',
});

// Set up Postgres connection pool for storing session data.
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // DB URL from .env.
});

// Confirm SESSION_SECRET is set up in .env;
// This secret is critical for signing session cookies securely.
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET is not defined in the environment variables');
}

// Configure Express session middleware with Postgres session store.
const sessionConfig = {
  secret: sessionSecret, // Session secret to sign the session ID cookie.
  resave: false, // Don't save session if unmodified.
  saveUninitialized: false, // Don't create session until something is stored.
  store: new PgSession({
    // Use Postgres to store session data instead of memory.
    pool: pgPool, // Connection pool for Postgres.
    tableName: 'session', // Table name for storing session information.
  }),
  cookie: {
    httpOnly: true, // Prevent client-side JS access to cookie for security.,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie expiration: 1 week.
  },
};

// Initialize Passport.js configuration for authentication strategies.
initializePassport();

// Register Express session middleware BEFORE Passport session middleware, so Passport can access session data.
app.use(session(sessionConfig));

// Initialize passport authentication middleware.
app.use(passport.initialize());

// Enable persistent login sessions.
app.use(passport.session());

// -- Mount route handlers for different app sections: --

// Routes related to job applications.
app.use('/applications', applicationsRoutes);

// Routes related to authentication (login, logout, signup).
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth', authRoutes);

// Define home route: render login page as default landing page.
app.get('/', (req: Request, res: Response) => {
  res.render('login');
});

// Define the port to listen on from environment variable or default 3000.
const port = process.env.PORT || 3000;

// Start Express server and listen for incoming requests on defined port.
app.listen(port, () => {
  console.log(`Listening on Port ${port}.`);
});
