"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  ChartNoAxesCombined,
  UserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "Monthly Budget",
    href: "/budget",
    icon: Wallet,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserRound,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="flex items-center justify-between bg-[#194D3B] px-4 py-4 text-white md:hidden">
        <Link href="/dashboard" className="text-lg font-bold">
          Finance Tracker
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="rounded-lg p-2 hover:bg-white/10"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#194D3B] text-white transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="border-b border-white/10 px-6 py-7">
          <Link href="/dashboard" className="text-xl font-bold">
            Finance Tracker
          </Link>

          <p className="mt-1 text-xs text-green-200">
            Personal Finance Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-green-300">
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-[#194D3B]"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-green-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={19} />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
