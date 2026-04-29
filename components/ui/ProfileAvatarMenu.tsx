"use client";

import * as Popover from "@radix-ui/react-popover";
import { CircleUser } from "lucide-react";
import Link from "next/link";

interface ProfileAvatarMenuProps {
  name: string | null;
  email: string | null;
}

export default function ProfileAvatarMenu({ name, email }: ProfileAvatarMenuProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          aria-label="Open profile menu"
          className="rounded-full p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <CircleUser className="h-6 w-6" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-20 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
        >
          <div className="mb-3 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Name</p>
            <p className="text-sm text-gray-800">{name ?? "No name set"}</p>
          </div>
          <div className="mb-4 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
            <p className="truncate text-sm text-gray-800">{email}</p>
          </div>
          <Popover.Close asChild>
            <Link
              href="/profile"
              className="block w-full rounded-md bg-gray-900 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-gray-700"
            >
              Edit Details
            </Link>
          </Popover.Close>
          <Popover.Arrow className="fill-gray-200" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
