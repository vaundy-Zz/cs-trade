import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-6">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to the Auth Demo
            </h1>
            <p className="text-lg text-gray-600">
              Authenticate with email/password or Steam, manage your preferences,
              alerts, and watchlists with secure server-side sessions.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {session ? (
              <>
                <p className="text-gray-700">
                  Signed in as <span className="font-semibold">{session.user?.email || session.user?.name}</span>
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-blue-600 px-6 py-2 text-white shadow hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="rounded-md bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/auth/signout"
                    className="rounded-md bg-red-600 px-6 py-2 text-white shadow hover:bg-red-700"
                  >
                    Sign out
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700">
                  Get started by signing in or creating an account.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/auth/signin"
                    className="rounded-md bg-blue-600 px-6 py-2 text-white shadow hover:bg-blue-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-md bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200"
                  >
                    Create account
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
