"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-700">Signing you out...</h2>
    </div>
  );
}
