"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const infoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type InfoValues = z.infer<typeof infoSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

interface User {
  id: number;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  address: string | null;
}

export default function ProfileForm({ user }: { user: User }) {
  const [infoStatus, setInfoStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pwStatus, setPwStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const infoForm = useForm<InfoValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email,
      phoneNumber: user.phoneNumber ?? "",
      address: user.address ?? "",
    },
  });

  const pwForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onInfoSubmit(values: InfoValues) {
    setInfoStatus(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setInfoStatus({ type: "error", message: data.error ?? "Failed to update profile" });
    } else {
      setInfoStatus({ type: "success", message: "Profile updated successfully" });
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    setPwStatus(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwStatus({ type: "error", message: data.error ?? "Failed to change password" });
    } else {
      setPwStatus({ type: "success", message: "Password changed successfully" });
      pwForm.reset();
    }
  }

  return (
    <div className="space-y-8">
      {/* General Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">General Information</h2>
        <form onSubmit={infoForm.handleSubmit(onInfoSubmit)} className="space-y-4">
          <Field label="Name" error={infoForm.formState.errors.name?.message}>
            <input
              {...infoForm.register("name")}
              placeholder="Your full name"
              className={inputCls(!!infoForm.formState.errors.name)}
            />
          </Field>

          <Field label="Email" error={infoForm.formState.errors.email?.message}>
            <input
              {...infoForm.register("email")}
              type="email"
              placeholder="you@example.com"
              className={inputCls(!!infoForm.formState.errors.email)}
            />
          </Field>

          <Field label="Phone Number" error={infoForm.formState.errors.phoneNumber?.message}>
            <input
              {...infoForm.register("phoneNumber")}
              type="tel"
              placeholder="+1 555 000 0000"
              className={inputCls(!!infoForm.formState.errors.phoneNumber)}
            />
          </Field>

          <Field label="Address" error={infoForm.formState.errors.address?.message}>
            <textarea
              {...infoForm.register("address")}
              rows={3}
              placeholder="123 Main St, City, Country"
              className={inputCls(!!infoForm.formState.errors.address)}
            />
          </Field>

          {infoStatus && <Banner type={infoStatus.type} message={infoStatus.message} />}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={infoForm.formState.isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {infoForm.formState.isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Change Password</h2>
        <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Field label="Current Password" error={pwForm.formState.errors.currentPassword?.message}>
            <input
              {...pwForm.register("currentPassword")}
              type="password"
              autoComplete="current-password"
              className={inputCls(!!pwForm.formState.errors.currentPassword)}
            />
          </Field>

          <Field label="New Password" error={pwForm.formState.errors.newPassword?.message}>
            <input
              {...pwForm.register("newPassword")}
              type="password"
              autoComplete="new-password"
              className={inputCls(!!pwForm.formState.errors.newPassword)}
            />
          </Field>

          <Field label="Confirm New Password" error={pwForm.formState.errors.confirmPassword?.message}>
            <input
              {...pwForm.register("confirmPassword")}
              type="password"
              autoComplete="new-password"
              className={inputCls(!!pwForm.formState.errors.confirmPassword)}
            />
          </Field>

          {pwStatus && <Banner type={pwStatus.type} message={pwStatus.message} />}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwForm.formState.isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {pwForm.formState.isSubmitting ? "Changing…" : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Banner({ type, message }: { type: "success" | "error"; message: string }) {
  const base = "rounded-md px-4 py-3 text-sm";
  const cls =
    type === "success"
      ? `${base} bg-green-50 text-green-800 border border-green-200`
      : `${base} bg-red-50 text-red-800 border border-red-200`;
  return <div className={cls}>{message}</div>;
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-blue-500",
    hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white",
  ].join(" ");
}
