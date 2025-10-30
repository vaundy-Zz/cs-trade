"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, error, isLoading } = useSWR(
    session ? "/api/alerts" : null,
    fetcher
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Bell className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Sign In Required</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please sign in to view and manage your price alerts
        </p>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Alerts</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const alerts = data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Bell className="h-10 w-10 text-primary" />
            My Alerts
          </h1>
          <p className="text-muted-foreground">
            Manage your price alerts and notifications
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-lg border bg-card">
          <Bell className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No alerts yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create your first alert to get notified about price changes
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(
            (alert: {
              id: string;
              skin?: { name?: string };
              isActive: boolean;
              type: string;
              condition: string;
              targetValue?: number;
              changePercent?: number;
              listing?: { market?: { name?: string } };
            }) => (
              <div
                key={alert.id}
                className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {alert.skin?.name || "Unknown Skin"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {alert.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Type:</span> {alert.type}
                      </p>
                      <p>
                        <span className="font-medium">Condition:</span>{" "}
                        {alert.condition}
                      </p>
                      {alert.targetValue && (
                        <p>
                          <span className="font-medium">Target:</span> $
                          {Number(alert.targetValue).toFixed(2)}
                        </p>
                      )}
                      {alert.changePercent && (
                        <p>
                          <span className="font-medium">Change:</span>{" "}
                          {Number(alert.changePercent).toFixed(2)}%
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Market:</span>{" "}
                        {alert.listing?.market?.name || "All Markets"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
