import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.name || session.user?.email}!</h2>
          <p className="text-gray-600 mb-4">
            You are signed in and have access to protected features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/profile"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600">View and edit your profile information</p>
          </Link>

          <Link
            href="/preferences"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferences</h3>
            <p className="text-gray-600">Manage your application preferences</p>
          </Link>

          <Link
            href="/alerts"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alerts</h3>
            <p className="text-gray-600">Configure and manage your alerts</p>
          </Link>

          <Link
            href="/watchlists"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Watchlists</h3>
            <p className="text-gray-600">Create and manage watchlists</p>
          </Link>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
