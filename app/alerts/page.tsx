import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AlertsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const alerts = await prisma.alert.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <Link
            href="/dashboard"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Alerts ({alerts.length})
            </h2>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No alerts configured yet.</p>
              <p className="text-sm text-gray-400">
                Use the API endpoints to create alerts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.description || "No description"}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Type: {alert.type}</span>
                        <span>
                          Status: {alert.isActive ? "Active" : "Inactive"}
                        </span>
                        <span>
                          Created: {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {alert.condition && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Condition: {alert.condition}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            API Endpoints
          </h3>
          <div className="text-xs text-blue-800 space-y-1">
            <p>
              <span className="font-mono">POST /api/alerts</span> - Create a new
              alert
            </p>
            <p>
              <span className="font-mono">PUT /api/alerts/[id]</span> - Update an
              alert
            </p>
            <p>
              <span className="font-mono">DELETE /api/alerts/[id]</span> - Delete
              an alert
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
