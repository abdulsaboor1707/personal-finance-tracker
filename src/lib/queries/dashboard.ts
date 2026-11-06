import "server-only";

import { pool } from "@/lib/db";

export async function getDashboardData(userId: string) {
  // 1. Current month's income and expenses
  const summaryQuery = pool.query(
    `
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS income,
        COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expenses
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    `,
    [userId],
  );

  // 2. Current month's budget
  const budgetQuery = pool.query(
    `
      SELECT amount
      FROM budgets
      WHERE user_id = $1
        AND month = DATE_TRUNC('month', CURRENT_DATE)::DATE
    `,
    [userId],
  );

  // 3. Last six months: income versus expenses
  const monthlyQuery = pool.query(
    `
      WITH months AS (
        SELECT GENERATE_SERIES(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        )::DATE AS month
      )
      SELECT
        TO_CHAR(m.month, 'Mon') AS month,
        COALESCE(
          SUM(t.amount) FILTER (WHERE t.type = 'income'),
          0
        ) AS income,
        COALESCE(
          SUM(t.amount) FILTER (WHERE t.type = 'expense'),
          0
        ) AS expenses
      FROM months m
      LEFT JOIN transactions t
        ON t.user_id = $1
        AND t.transaction_date >= m.month
        AND t.transaction_date < m.month + INTERVAL '1 month'
      GROUP BY m.month
      ORDER BY m.month
    `,
    [userId],
  );

  // 4. Current month's expenses grouped by category
  const categoryQuery = pool.query(
    `
      SELECT
        c.name AS category,
        SUM(t.amount) AS amount
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
        AND t.type = 'expense'
        AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND t.transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      GROUP BY c.id, c.name
      ORDER BY amount DESC
    `,
    [userId],
  );

  // 5. Eight most recent transactions
  const recentQuery = pool.query(
    `
      SELECT
        t.id,
        t.description,
        t.type,
        t.amount,
        t.transaction_date,
        c.name AS category
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 8
    `,
    [userId],
  );

  // Execute all five queries together
  const [
    summaryResult,
    budgetResult,
    monthlyResult,
    categoryResult,
    recentResult,
  ] = await Promise.all([
    summaryQuery,
    budgetQuery,
    monthlyQuery,
    categoryQuery,
    recentQuery,
  ]);

  // PostgreSQL NUMERIC values are returned as strings by pg.
  const income = Number(summaryResult.rows[0].income);
  const expenses = Number(summaryResult.rows[0].expenses);
  const budget = Number(budgetResult.rows[0]?.amount ?? 0);

  return {
    summary: {
      income,
      expenses,
      balance: income - expenses,
    },

    budget: {
      amount: budget,
      remaining: budget - expenses,
      percentage: budget > 0 ? (expenses / budget) * 100 : 0,
    },

    monthly: monthlyResult.rows.map((row) => ({
      month: row.month,
      income: Number(row.income),
      expenses: Number(row.expenses),
    })),

    categories: categoryResult.rows.map((row) => ({
      category: row.category,
      amount: Number(row.amount),
    })),

    recentTransactions: recentResult.rows.map((row) => ({
      id: String(row.id),
      description: row.description,
      type: row.type,
      amount: Number(row.amount),
      transactionDate: row.transaction_date,
      category: row.category,
    })),
  };
}
