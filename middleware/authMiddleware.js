import passport from "passport";

// not in use.
export const authenticateLocal = passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/login",
});
