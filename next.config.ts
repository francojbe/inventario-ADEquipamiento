import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",           // produces minimal self-contained server
  images: { unoptimized: true },  // avoids sharp dependency issues in Docker
};

export default nextConfig;
