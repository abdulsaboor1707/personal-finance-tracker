import { Suspense } from "react";

import { requireUser } from "@/lib/auth/dal";
import {
  getTransactions,
  getTransactionCategories,
} from "@/lib/queries/transactions";

import AppSidebar from "@/components/layout/AppSidebar";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import TransactionFilters from "@/components/dashboard/TransactionFilters";

type TransactionsPageProps = {
  searchParams: Promise<{
    categoryId?: string;
    month?: string;
    type?: string;
  }>;
};

async function TransactionsContent({ searchParams }: TransactionsPageProps) {
  const user = await requireUser();

  const params = await searchParams;

  // Validate the filter values received from the URL.
  const categoryId =
    params.categoryId && /^\d+$/.test(params.categoryId)
      ? params.categoryId
      : undefined;

  const month =
    params.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month)
      ? `${params.month}-01`
      : undefined;

  const type =
    params.type === "income" || params.type === "expense" ? params.type : "all";

  // Fetch transactions and categories together.
  const [transactions, categories] = await Promise.all([
    getTransactions(user.id, {
      categoryId,
      month,
      type,
    }),
    getTransactionCategories(user.id),
  ]);

  return (
    <div className="min-h-screen bg-[#F3F5F2] md:flex">
      <AppSidebar />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-[#194D3B]">Transactions</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your income and expenses, {user.name}.
            </p>
          </header>

          <TransactionFilters
            categories={categories}
            currentFilters={{
              categoryId,
              month: params.month,
              type,
            }}
          />

          <TransactionsTable transactions={transactions} />
        </div>
      </main>
    </div>
  );
}

export default function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F3F5F2]">
          <p className="text-sm text-gray-500">Loading transactions...</p>
        </main>
      }
    >
      <TransactionsContent searchParams={searchParams} />
    </Suspense>
  );
}
