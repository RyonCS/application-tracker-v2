// Import the `User` type from the Prisma schema.
// This ensures type safety and consistency across the app wherever the user model is used.

import type { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    /**
     * Extend the default Express `User` type (used by Passport)
     * to match the Prisma `User` model.
     * This lets TypeScript know that `req.user` contains all the fields
     * from the database User (e.g., id, emailAddress, passwordHash, etc.)
     */
    interface User extends PrismaUser {}

    /**
     * Add type information to Express's `Request` object so TypeScript
     * knows that `req.user` is an optional `PrismaUser`.
     */
    interface Request {
      user?: PrismaUser;
    }
  }
}
