import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import LoginForm from "@/components/forms/LoginForm";
import { getCurrentUser } from "@/lib/auth/dal";

async function LoginContent() {
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
            Welcome back! Please log in to continue.
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <p className="text-sm text-gray-600">Loading login page...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
