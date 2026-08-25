import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,

  images: {
    unoptimized: true,
  },

  basePath: "/component-lib",
  assetPrefix: "/component-lib/",
};

export default nextConfig;
