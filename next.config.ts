import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder thumbnails/avatars are our own trusted local SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
