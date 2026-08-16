import type { NextConfig } from "next";

const basePath = process.env.GITHUB_PAGES === "1" ? "/myntra-verdict" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
