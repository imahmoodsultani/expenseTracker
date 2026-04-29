import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";
import NavLink from "@/components/ui/NavLink";
import MobileNav from "@/components/ui/MobileNav";
import ProfileAvatarMenu from "@/components/ui/ProfileAvatarMenu";

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
          <nav className="flex items-center gap-3 md:gap-6">
            <span className="font-semibold text-gray-900">Expense Tracker</span>
            <span className="hidden items-center gap-6 md:flex">
              <NavLink href="/" exact>
                Expenses
              </NavLink>
              <NavLink href="/projects">Projects</NavLink>
              <NavLink href="/reports">Reports</NavLink>
            </span>
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden items-center gap-2 md:flex md:gap-3">
              <ProfileAvatarMenu
                name={session.user.name ?? null}
                email={session.user.email ?? null}
              />
              <SignOutButton />
            </span>
            <MobileNav />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
}
