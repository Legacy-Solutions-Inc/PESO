import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // News photo uploads run through a Server Action with up to 4 MB per
  // file (NEWS_PHOTO_MAX_BYTES). The default Server Action body cap is
  // 1 MB, which trips immediately on any real photo. Bump to 5 MB to
  // give a small overhead above the 4 MB validation ceiling.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
