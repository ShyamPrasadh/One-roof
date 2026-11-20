import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Orders, stock and prices are live data, so pages render per request (see src/app/layout.tsx).
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
