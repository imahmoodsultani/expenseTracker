"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}

export default function NavLink({ href, exact = false, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        isActive ? "font-medium text-blue-600" : "text-gray-600 hover:text-blue-600"
      }`}
    >
      {children}
    </Link>
  );
}
