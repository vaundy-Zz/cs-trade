import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WatchlistsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const watchlists = await prisma.watchlist.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Watchlists</h1>
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
              Your Watchlists ({watchlists.length})
            </h2>
          </div>

          {watchlists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No watchlists created yet.</p>
              <p className="text-sm text-gray-400">
                Use the API endpoints to create watchlists.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {watchlists.map((watchlist) => (
                <div
                  key={watchlist.id}
                  className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {watchlist.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {watchlist.description || "No description"}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Items: {watchlist.items.length}</span>
                        <span>
                          Created: {new Date(watchlist.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {watchlist.items.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase">Items</h4>
                          <ul className="mt-2 space-y-2">
                            {watchlist.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex justify-between text-sm text-gray-600"
                              >
                                <span>{item.itemName}</span>
                                <span className="text-xs text-gray-400">
                                  {item.itemType} • {item.itemId}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">
            API Endpoints
          </h3>
          <div className="text-xs text-indigo-800 space-y-1">
            <p>
              <span className="font-mono">POST /api/watchlists</span> - Create a
              new watchlist
            </p>
            <p>
              <span className="font-mono">PUT /api/watchlists/[id]</span> - Update a
              watchlist
            </p>
            <p>
              <span className="font-mono">DELETE /api/watchlists/[id]</span> - Delete
              a watchlist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
