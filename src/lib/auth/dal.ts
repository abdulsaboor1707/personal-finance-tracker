import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export const getCurrentUser = cache(async () => {
  // 1. Check the session
  const session = await getSession();

  if (!session) {
    return null;
  }

  // 2. Find the user in the database
  const result = await pool.query(
    `
      SELECT id, name, email
      FROM users
      WHERE id = $1
    `,
    [session.userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  // 3. Return user information
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
  };
});

// Require an authenticated user
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
