"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

const navLinks = [
  { href: "/", label: "Expenses", exact: true },
  { href: "/projects", label: "Projects", exact: false },
  { href: "/reports", label: "Reports", exact: false },
  { href: "/profile", label: "Profile", exact: false },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <span className="font-semibold text-gray-900">Expense Tracker</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col py-2">
          {navLinks.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-3 text-sm transition-colors ${
                isActive(href, exact)
                  ? "bg-blue-50 font-medium text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="mt-2 border-t border-gray-200 px-4 pt-3">
            <SignOutButton />
          </div>
        </nav>
      </div>
    </>
  );
}
