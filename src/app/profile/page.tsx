"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Sign In Required</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please sign in to view your profile
        </p>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-6 mb-6">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-2 border-primary"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
            <p className="text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-medium">{session?.user?.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{session?.user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Display Name</span>
                <span className="font-medium">{session?.user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-md bg-accent/50">
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Watchlists</p>
          </div>
          <div className="text-center p-4 rounded-md bg-accent/50">
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Active Alerts</p>
          </div>
          <div className="text-center p-4 rounded-md bg-accent/50">
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Investments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
