import "server-only";

import { pool } from "@/lib/db";

type TransactionFilters = {
  categoryId?: string;
  month?: string;
  type?: "income" | "expense" | "all";
};

const PAGE_SIZE = 10;

export async function getTransactions(
  userId: string,
  filters: TransactionFilters = {},
  page = 1,
) {
  const values: (string | number)[] = [userId];

  const whereConditions = ["t.user_id = $1"];

  if (filters.categoryId) {
    values.push(filters.categoryId);
    whereConditions.push(`t.category_id = $${values.length}`);
  }

  if (filters.type && filters.type !== "all") {
    values.push(filters.type);
    whereConditions.push(`t.type = $${values.length}`);
  }

  if (filters.month) {
    values.push(filters.month);
    whereConditions.push(`t.transaction_date >= $${values.length}::DATE`);

    values.push(filters.month);
    whereConditions.push(
      `t.transaction_date < ($${values.length}::DATE + INTERVAL '1 month')`,
    );
  }

  // Count all transactions matching the selected filters.
  const countResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM transactions t
      INNER JOIN categories c
        ON c.id = t.category_id
      WHERE ${whereConditions.join(" AND ")}
    `,
    values,
  );

  const totalCount = Number(countResult.rows[0].total);

  // Calculate pagination information.
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);

  const offset = (currentPage - 1) * PAGE_SIZE;

  // Retrieve only 10 transactions for the requested page.
  const paginationValues = [...values, PAGE_SIZE, offset];

  const result = await pool.query(
    `
      SELECT
        t.id,
        t.description,
        t.type,
        t.amount,
        TO_CHAR(t.transaction_date, 'YYYY-MM-DD') AS transaction_date,
        c.name AS category
      FROM transactions t
      INNER JOIN categories c
        ON c.id = t.category_id
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT $${paginationValues.length - 1}
      OFFSET $${paginationValues.length}
    `,
    paginationValues,
  );

  const transactions = result.rows.map((row) => ({
    id: String(row.id),
    description: row.description,
    type: row.type as "income" | "expense",
    amount: Number(row.amount),
    transactionDate: row.transaction_date,
    category: row.category,
  }));

  return {
    transactions,
    totalCount,
    totalPages,
    currentPage,
    pageSize: PAGE_SIZE,
  };
}

export async function getTransactionCategories(userId: string) {
  const result = await pool.query(
    `
      SELECT id, name, type
      FROM categories
      WHERE user_id = $1
      ORDER BY type, name
    `,
    [userId],
  );

  return result.rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    type: row.type as "income" | "expense",
  }));
}
