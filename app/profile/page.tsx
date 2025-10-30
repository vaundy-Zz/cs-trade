import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      preferences: true,
      alerts: true,
      watchlists: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.name || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        {user.preferences ? (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Theme</p>
                <p className="text-sm text-gray-900 capitalize">{user.preferences.theme}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notifications</p>
                <p className="text-sm text-gray-900">
                  {user.preferences.notifications ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Alerts</p>
                <p className="text-sm text-gray-900">
                  {user.preferences.emailAlerts ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
            <p className="text-gray-600">No preferences configured yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts</h2>
            {user.alerts.length === 0 ? (
              <p className="text-gray-600">No alerts configured.</p>
            ) : (
              <ul className="space-y-4">
                {user.alerts.map((alert) => (
                  <li key={alert.id} className="border border-gray-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600">Type: {alert.type}</p>
                    <p className="text-sm text-gray-600">{alert.description || "No description"}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Watchlists</h2>
            {user.watchlists.length === 0 ? (
              <p className="text-gray-600">No watchlists created.</p>
            ) : (
              <ul className="space-y-4">
                {user.watchlists.map((watchlist) => (
                  <li key={watchlist.id} className="border border-gray-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{watchlist.name}</h3>
                    <p className="text-sm text-gray-600">{watchlist.description || "No description"}</p>
                    <p className="text-sm text-gray-600">
                      Items: {watchlist.items.length}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
