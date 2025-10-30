"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  TrendingUp,
  Trophy,
  Package,
  Bell,
  User,
} from "lucide-react";

export function Navigation() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <Package className="h-6 w-6" />
              <span>CS Skins Market</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/trends"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Trends</span>
              </Link>
              <Link
                href="/leaderboards"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboards</span>
              </Link>
              {session && (
                <Link
                  href="/alerts"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  <span>Alerts</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {session.user?.name || "Profile"}
                    </span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => signIn("steam")}
              >
                Sign In with Steam
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
