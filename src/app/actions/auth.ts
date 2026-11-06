"use server";

import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type RegisterState = {
  error?: string;
};
export type LoginState = {
  error?: string;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // 1. Get form values
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // 2. Validate form values
  const validation = registerSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
  });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const {
    name: validName,
    email: validEmail,
    password: validPassword,
  } = validation.data;

  // 3. Check whether email already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [validEmail.toLowerCase()],
  );

  if (existingUser.rows.length > 0) {
    return {
      error: "An account with this email already exists.",
    };
  }

  // 4. Hash password
  const passwordHash = await hashPassword(validPassword);

  // 5. Start database transaction
  const client = await pool.connect();

  let userId: string;

  try {
    await client.query("BEGIN");

    // 6. Insert new user
    const userResult = await client.query(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [validName, validEmail.toLowerCase(), passwordHash],
    );

    userId = String(userResult.rows[0].id);

    // 7. Copy active default categories for this user
    await client.query(
      `
        INSERT INTO categories (user_id, name, type)
        SELECT $1, name, type
        FROM default_categories
        WHERE is_active = TRUE
      `,
      [userId],
    );

    // 8. Complete transaction
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Registration error:", error);

    return {
      error: "Unable to create your account. Please try again.",
    };
  } finally {
    client.release();
  }

  // 9. Create login session
  await createSession({
    userId,
    email: validEmail.toLowerCase(),
  });

  // 10. Redirect to dashboard
  redirect("/dashboard");
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // 1. Get form values
  const email = formData.get("email");
  const password = formData.get("password");

  // 2. Validate form values
  const validation = loginSchema.safeParse({
    email,
    password,
  });

  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const { email: validEmail, password: validPassword } = validation.data;

  // 3. Find user by email
  const result = await pool.query(
    `
      SELECT id, email, password_hash
      FROM users
      WHERE email = $1
    `,
    [validEmail.toLowerCase()],
  );

  if (result.rows.length === 0) {
    return {
      error: "Invalid email or password.",
    };
  }

  const user = result.rows[0];

  // 4. Verify password

  const passwordMatches = await verifyPassword(
    validPassword,
    user.password_hash,
  );

  if (!passwordMatches) {
    return {
      error: "Invalid email or password.",
    };
  }

  // 5. Create login session
  await createSession({
    userId: String(user.id),
    email: user.email,
  });

  // 6. Redirect to dashboard
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();

  redirect("/login");
}
