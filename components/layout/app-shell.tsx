"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Header } from "./header";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const mainId = React.useId();

  const handleMobileMenuToggle = React.useCallback(() => {
    setIsMobileSidebarOpen((previous) => !previous);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href={`#${mainId}`}
        className="focus-visible:ring-ring/90 focus-visible:ring-offset-background pointer-events-none absolute left-4 top-4 z-[100] -translate-y-16 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform focus:pointer-events-auto focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Skip to main content
      </a>
      <Header onMobileMenuToggle={handleMobileMenuToggle} />
      <div className="flex flex-1">
        <MobileSidebar isOpen={isMobileSidebarOpen} onClose={handleClose} />
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-background md:block">
          <Sidebar />
        </aside>
        <main
          id={mainId}
          className={cn(
            "flex-1 overflow-y-auto bg-muted/20",
            "focus-visible:outline-none"
          )}
          aria-label="Main content"
          tabIndex={-1}
        >
          <div className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-8 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
