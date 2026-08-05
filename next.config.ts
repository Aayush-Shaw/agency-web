import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private LAN ranges, so a new router-assigned IP doesn't break phone testing.
  allowedDevOrigins: ["10.*.*.*", "172.*.*.*", "192.168.*.*", "127.0.0.1"],
};

export default nextConfig;
