"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Gauge,
  Home,
  Layers,
  Package,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Projects", href: "/projects", icon: Layers },
  { name: "Reporting", href: "/reporting", icon: Gauge },
  { name: "Components", href: "/components-demo", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-1 flex-col gap-4 p-4"
      aria-label="Primary"
      role="navigation"
    >
      <div className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Need more insights?</p>
        <p className="mt-1">
          Upgrade to a growth plan to unlock predictive analytics and advanced reporting.
        </p>
        <Link
          href="/pricing"
          onClick={onNavigate}
          className="mt-4 inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Explore plans
        </Link>
      </div>
    </nav>
  );
}
