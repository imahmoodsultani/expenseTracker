"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-gray-600 hover:text-red-600 border border-gray-200 rounded-md px-3 py-1 hover:border-red-300 transition-colors"
    >
      Sign out
    </button>
  );
}
