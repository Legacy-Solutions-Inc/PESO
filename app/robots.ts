import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://peso-lambunao.example.gov.ph";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/news", "/news/", "/jobs", "/jobs/", "/privacy"],
        disallow: [
          "/dashboard",
          "/admin",
          "/admin/",
          "/jobseekers",
          "/jobseekers/",
          "/users",
          "/users/",
          "/notifications",
          "/notifications/",
          "/api",
          "/api/",
          "/login",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
          "/auth/callback",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
