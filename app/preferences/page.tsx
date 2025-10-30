"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PreferencesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState({
    theme: "light",
    notifications: true,
    emailAlerts: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/preferences")}`);
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/preferences");
        if (response.ok) {
          const data = await response.json();
          setPreferences({
            theme: data.theme || "light",
            notifications: data.notifications ?? true,
            emailAlerts: data.emailAlerts ?? false,
          });
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPreferences();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setMessage("Preferences saved successfully!");
      } else {
        setMessage("Failed to save preferences");
      }
    } catch (error) {
      setMessage("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Preferences</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="theme"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Theme
              </label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) =>
                  setPreferences({ ...preferences, theme: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={preferences.notifications}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notifications: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="notifications"
                className="ml-2 block text-sm text-gray-700"
              >
                Enable notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailAlerts"
                checked={preferences.emailAlerts}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    emailAlerts: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="emailAlerts"
                className="ml-2 block text-sm text-gray-700"
              >
                Enable email alerts
              </label>
            </div>

            {message && (
              <div
                className={`rounded-md p-4 ${
                  message.includes("success")
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
              <a
                href="/dashboard"
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200"
              >
                Back to Dashboard
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
