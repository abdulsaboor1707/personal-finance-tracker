import Link from "next/link";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/forms/RegisterForm";
import { getCurrentUser } from "@/lib/auth/dal";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Personal Finance Tracker
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage your income and expenses in one place.
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
