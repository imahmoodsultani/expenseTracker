import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";
import NavLink from "@/components/ui/NavLink";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <span className="font-semibold text-gray-900">Expense Tracker</span>
            <NavLink href="/" exact>
              Expenses
            </NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/reports">Reports</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
