// Extend the default SessionData interface provided by 'express-session'
// to include a custom property `user_id`, allowing TypeScript to recognize
// that this field exists on req.session throughout the app.

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user_id: string; // Custom property added to session object to track the user's ID.
  }
}
