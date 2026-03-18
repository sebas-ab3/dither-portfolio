import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack(config) {
    config.module.rules.push({ test: /\.glsl$/, use: "raw-loader" });
    return config;
  },
};

export default nextConfig;
