import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma client must not be bundled by the Next.js edge runtime
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-libsql", "@libsql/client", "libsql", "bcryptjs"],
};

export default nextConfig;
