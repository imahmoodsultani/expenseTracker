import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Create account — Expense Tracker" };

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Start tracking your expenses</p>
        <RegisterForm />
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
