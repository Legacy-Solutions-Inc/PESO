import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Disallow embedding the app in iframes — defense against clickjacking on
  // the staff dashboard. The public site has no embedded use-case either.
  { key: "X-Frame-Options", value: "DENY" },
  // Browsers must respect the declared MIME type. Prevents inline-script
  // tricks against image/text endpoints.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Strip the referrer when navigating to other origins; keep it on
  // same-origin so /jobseekers → /jobseekers/{id} navigation analytics work.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Conservative defaults: no camera/microphone/geolocation access. The
  // photo uploader uses File input, not getUserMedia.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
];

// Pull the Supabase Storage hostname out of NEXT_PUBLIC_SUPABASE_URL
// so next/image can optimize uploaded photos served from public-media.
function supabaseImageHost(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

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
  images: {
    remotePatterns: (() => {
      const host = supabaseImageHost();
      if (!host) return [];
      return [
        {
          protocol: "https",
          hostname: host,
          pathname: "/storage/v1/object/public/**",
        },
      ];
    })(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
