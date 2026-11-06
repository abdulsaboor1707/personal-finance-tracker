import Link from "next/link";

type TransactionPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  currentFilters: {
    categoryId?: string;
    month?: string;
    type?: string;
  };
};

export default function TransactionPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  currentFilters,
}: TransactionPaginationProps) {
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(currentPage * pageSize, totalCount);

  function getPageUrl(page: number) {
    const params = new URLSearchParams();

    if (currentFilters.categoryId) {
      params.set("categoryId", currentFilters.categoryId);
    }

    if (currentFilters.month) {
      params.set("month", currentFilters.month);
    }

    if (currentFilters.type && currentFilters.type !== "all") {
      params.set("type", currentFilters.type);
    }

    params.set("page", String(page));

    return `/transactions?${params.toString()}`;
  }

  const linkClass =
    "rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100";

  const disabledClass =
    "cursor-not-allowed rounded-lg border border-gray-100 px-4 py-2 text-sm text-gray-400";

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing {startRecord}–{endRecord} of {totalCount} transactions
      </p>

      <div className="flex items-center gap-3">
        {currentPage > 1 ? (
          <Link href={getPageUrl(currentPage - 1)} className={linkClass}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass}>Previous</span>
        )}

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link href={getPageUrl(currentPage + 1)} className={linkClass}>
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </div>
  );
}
