import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "FactWorld";
const basePath = isProd ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
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
