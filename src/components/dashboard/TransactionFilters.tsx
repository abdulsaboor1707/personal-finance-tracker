"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type TransactionFiltersProps = {
  categories: Category[];
  currentFilters: {
    categoryId?: string;
    month?: string;
    type?: string;
  };
};

export default function TransactionFilters({
  categories,
  currentFilters,
}: TransactionFiltersProps) {
  const router = useRouter();

  const [loading, setLoading] = useState<"apply" | "reset" | null>(null);

  // Stop the loading indicator when the new filters arrive.
  useEffect(() => {
    setLoading(null);
  }, [currentFilters.categoryId, currentFilters.month, currentFilters.type]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const categoryId = formData.get("categoryId")?.toString();
    const month = formData.get("month")?.toString();
    const type = formData.get("type")?.toString();

    if (categoryId) params.set("categoryId", categoryId);
    if (month) params.set("month", month);
    if (type && type !== "all") params.set("type", type);

    const queryString = params.toString();
    const url = queryString ? `/transactions?${queryString}` : "/transactions";

    setLoading("apply");
    router.push(url, { scroll: false });
  }

  function handleReset() {
    if (
      !currentFilters.categoryId &&
      !currentFilters.month &&
      (!currentFilters.type || currentFilters.type === "all")
    ) {
      return;
    }

    setLoading("reset");
    router.push("/transactions", { scroll: false });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <label
          htmlFor="categoryId"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Category
        </label>

        <select
          id="categoryId"
          name="categoryId"
          defaultValue={currentFilters.categoryId || ""}
          disabled={loading !== null}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#194D3B] focus:ring-2 focus:ring-[#194D3B]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="month"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Month
        </label>

        <input
          id="month"
          name="month"
          type="month"
          defaultValue={currentFilters.month || ""}
          disabled={loading !== null}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#194D3B] focus:ring-2 focus:ring-[#194D3B]/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="type"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Transaction Type
        </label>

        <select
          id="type"
          name="type"
          defaultValue={currentFilters.type || "all"}
          disabled={loading !== null}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#194D3B] focus:ring-2 focus:ring-[#194D3B]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="flex items-end gap-2">
        <Button
          type="submit"
          disabled={loading !== null}
          className="flex-1 bg-[#194D3B] hover:bg-[#123B2D] disabled:opacity-60"
        >
          {loading === "apply" ? (
            <>
              <span className="animate-spin">⏳</span>
              Applying...
            </>
          ) : (
            "Apply Filters"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={loading !== null}
          onClick={handleReset}
          className="flex-1 disabled:opacity-60"
        >
          {loading === "reset" ? (
            <>
              <span className="animate-spin">⏳</span>
              Resetting...
            </>
          ) : (
            "Reset"
          )}
        </Button>
      </div>
    </form>
  );
}
