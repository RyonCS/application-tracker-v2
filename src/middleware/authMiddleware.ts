import passport from "passport";
import prisma from './../lib/prisma';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * Authenticats a user using email and password.
 * @param inputEmail - The user's email.
 * @param inputPassword - The user's password.
 * @returns The authenticated user or null if authentication fails.
 */
export const authenticateUser = async (inputEmail: string, inputPassword: string): Promise<User | null> => {
  // Check that the email exists.
  let user: User | null = null;
  try {
    user = await prisma.user.findUnique({
      where: {
        email: inputEmail,
      },
    })
    
    if (!user || !user.passwordHash) {
      return null;
    }
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }

  // Compare input password with stored password.
  const match = await bcrypt.compare(inputPassword, user.passwordHash);
  if (match) {
    return user;
  } else {
    return null;
  }
}

async function main() {
  console.log(await authenticateUser('ryon.sajnovsky@gmail.com', 'OwLolHs121!'));
}

main();
