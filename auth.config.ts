/**
 * Lightweight auth config — safe for Edge Runtime (used by middleware).
 * No Prisma here. Full config with PrismaAdapter lives in auth.ts.
 */
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { registerSchema } from "@/lib/schemas/category.schema";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize is intentionally omitted here — it lives in auth.ts
      // where Prisma is available. This config is only used by middleware
      // for JWT session inspection.
      authorize: async () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const pathname = new URL(request.url).pathname;
      // Allow public routes through without auth
      if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/api/")) {
        return true;
      }
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
