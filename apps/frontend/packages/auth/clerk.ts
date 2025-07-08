import { auth } from '@clerk/nextjs/server'

import { env } from "./env.mjs";

export async function getSessionUser() {
  const { sessionClaims } = await auth();
  if (env.ADMIN_EMAIL) {
    const adminEmails = env.ADMIN_EMAIL.split(",");
    if (sessionClaims?.user?.email) {
      sessionClaims.user.isAdmin = adminEmails.includes(sessionClaims?.user?.email);
    }
  }
  return sessionClaims?.user;
}
