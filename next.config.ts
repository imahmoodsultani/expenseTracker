import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma client must not be bundled by the Next.js edge runtime
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
