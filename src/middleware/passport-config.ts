import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from './../lib/prisma';

/**
 * Configures Passport.js local authentication strategy.
 * This sets up how users are authenticated using email and password,
 * and how user sessions are serialized and deserialized.
 */
export function initializePassport() {
  passport.use(
    // Define the local strategy using emailAddress as the usernameField.
    new LocalStrategy(
      { usernameField: 'emailAddress' }, // Tell passport to look for email address instead of username.
      async (emailAddress, password, done) => {
        // This callback runs whenever a LOGIN attempt occurs.
        try {
          // Look up user in the database by their email address.
          const user = await prisma.user.findUnique({
            where: { emailAddress },
          });

          // If no user is found, fail authentication.
          if (!user) {
            console.log('No user found.');
            return done(null, false, { message: 'No User Found.' });
          }

          // Use bcrypt to compare the plaintext password with the stored hashed password.
          const valid = await bcrypt.compare(password, user.passwordHash);

          // If the passwords don't match, fail authentication.
          if (!valid) {
            console.log("Passwords didn't match.");
            return done(null, false, { message: 'Wrong Password.' });
          }

          // User found, and passwords matched. Authenticate user and pass the user object.
          return done(null, user);
        } catch (error) {
          // Handle unexpected errors.
          return done(error);
        }
      },
    ),
  );

  // Serialize the users ID to store in the session cookie.
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize the user by their ID from the session cookie to get full user details.
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id as string },
      });
      done(null, user); // Pass the user object back to the request as req.user
    } catch (err) {
      done(err, null); // Pass errors if lookup fails.
    }
  });
}
