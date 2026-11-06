"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from "lucide-react";

type DashboardData = {
  summary: {
    income: number;
    expenses: number;
    balance: number;
  };

  budget: {
    amount: number;
    remaining: number;
    percentage: number;
  };

  monthly: {
    month: string;
    income: number;
    expenses: number;
  }[];

  categories: {
    category: string;
    amount: number;
  }[];

  recentTransactions: {
    id: string;
    description: string | null;
    type: string;
    amount: number;
    transactionDate: string;
    category: string;
  }[];
};

type DashboardViewProps = {
  userName: string;
  data: DashboardData;
};

const CATEGORY_COLORS = [
  "#EA6254",
  "#F5A43B",
  "#6385F5",
  "#9865E8",
  "#2DBF79",
  "#16A6A1",
  "#E879B2",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompact(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function SummaryCard({
  title,
  amount,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  amount: number;
  description: string;
  icon: typeof Wallet;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
        {formatCurrency(amount)}
      </p>

      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function DashboardView({ userName, data }: DashboardViewProps) {
  const { summary, budget } = data;

  const budgetPercentage = Math.min(Math.max(budget.percentage, 0), 100);

  const budgetExceeded = budget.remaining < 0;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <section className="rounded-2xl bg-[#194D3B] p-6 text-white shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-green-200">
              Financial overview
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Welcome back, {userName}!
            </h2>

            <p className="mt-2 text-sm text-green-100">
              Here is your financial position for this month.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <p className="text-sm text-green-200">Total income</p>
                <p className="mt-1 text-xl font-bold text-[#61D99A]">
                  {formatCurrency(summary.income)}
                </p>
              </div>

              <div>
                <p className="text-sm text-green-200">Total expenses</p>
                <p className="mt-1 text-xl font-bold text-[#FF8175]">
                  {formatCurrency(summary.expenses)}
                </p>
              </div>

              <div>
                <p className="text-sm text-green-200">Net balance</p>
                <p className="mt-1 text-xl font-bold">
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Budget overview */}
          <div className="rounded-xl bg-white/10 p-5">
            <div className="flex items-center gap-2">
              <PiggyBank size={20} className="text-green-200" />

              <p className="font-semibold">Monthly budget</p>
            </div>

            <p className="mt-5 text-sm text-green-200">Budget amount</p>

            <p className="text-2xl font-bold">
              {formatCurrency(budget.amount)}
            </p>

            <div className="mt-5 flex justify-between text-sm">
              <span className="text-green-200">Budget used</span>
              <span className="font-semibold">
                {budget.percentage.toFixed(1)}%
              </span>
            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetExceeded ? "bg-red-400" : "bg-[#61D99A]"
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 text-sm">
              <span className="text-green-200">
                {budgetExceeded ? "Over budget" : "Remaining"}
              </span>

              <span className="font-bold">
                {formatCurrency(Math.abs(budget.remaining))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total income"
          amount={summary.income}
          description="Income received this month"
          icon={ArrowUpRight}
          color="#2DBF79"
        />

        <SummaryCard
          title="Total expenses"
          amount={summary.expenses}
          description="Money spent this month"
          icon={ArrowDownRight}
          color="#EA6254"
        />

        <SummaryCard
          title="Available balance"
          amount={summary.balance}
          description="Income minus expenses"
          icon={Wallet}
          color="#6385F5"
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Monthly comparison chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Monthly financial trend
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Income compared with expenses over six months
            </p>
          </div>

          <div className="mt-6 h-[300px] w-full">
            {data.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthly}
                  margin={{ top: 10, right: 5, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />

                  <YAxis
                    tickFormatter={(value) => formatCompact(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />

                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                    }}
                  />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#2DBF79"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#EA6254"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No monthly data available.
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#2DBF79]" />
              Income
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#EA6254]" />
              Expenses
            </span>
          </div>
        </div>

        {/* Expense category chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Where your money goes
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Expenses grouped by category this month
            </p>
          </div>

          {data.categories.length > 0 ? (
            <div className="mt-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center">
              <div className="h-[240px] w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categories}
                      dataKey="amount"
                      nameKey="category"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {data.categories.map((category, index) => (
                        <Cell
                          key={category.category}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {data.categories.map((category, index) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        }}
                      />

                      <span className="truncate text-gray-600">
                        {category.category}
                      </span>
                    </div>

                    <span className="shrink-0 font-semibold text-gray-900">
                      {((category.amount / summary.expenses) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-gray-500">
              No expenses recorded this month.
            </div>
          )}
        </div>
      </section>

      {/* Recent transactions */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Recent transactions
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Your latest income and expenses
            </p>
          </div>

          <span className="text-sm text-gray-500">
            Latest {data.recentTransactions.length} records
          </span>
        </div>

        {data.recentTransactions.length > 0 ? (
          <div className="mt-5 divide-y divide-gray-100">
            {data.recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        isIncome
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {transaction.description || transaction.category}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {transaction.category} ·{" "}
                        {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`pl-14 text-sm font-bold sm:pl-0 ${
                      isIncome ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-gray-500">
            No transactions found.
          </p>
        )}
      </section>
    </div>
  );
}
