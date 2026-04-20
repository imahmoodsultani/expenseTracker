import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — Expense Tracker" };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back</p>
        <LoginForm />
        <p className="mt-4 text-sm text-center text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
