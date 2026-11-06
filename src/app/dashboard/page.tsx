import { Suspense } from "react";

import { requireUser } from "@/lib/auth/dal";
import { getDashboardData } from "@/lib/queries/dashboard";

import AppSidebar from "@/components/layout/AppSidebar";
import DashboardView from "@/components/dashboard/DashboardView";

async function DashboardContent() {
  const user = await requireUser();
  const dashboardData = await getDashboardData(user.id);

  return (
    <div className="min-h-screen bg-[#F3F5F2] md:flex">
      <AppSidebar />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-[#194D3B]">Dashboard</h1>

            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user.name}. Here&apos;s your financial overview.
            </p>
          </header>

          <DashboardView userName={user.name} data={dashboardData} />

          <footer className="py-6 text-center text-xs text-gray-500">
            Personal Finance Tracker · All amounts in PKR
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F3F5F2]">
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
