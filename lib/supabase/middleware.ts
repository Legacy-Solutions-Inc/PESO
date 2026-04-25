import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieOption = { name: string; value: string; options?: object };

/**
 * Routes that anyone (anon + authed) is allowed to read without the
 * middleware interfering. These belong to the public-facing surface
 * built in Step 1 of the public-landing/CMS rollout.
 */
const PUBLIC_PREFIXES = ["/news", "/jobs", "/privacy"] as const;

function isPublicPath(path: string): boolean {
  if (path === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const path = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieOption[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    path === "/login" || path === "/sign-up" || path === "/forgot-password";
  const isAuthCallback = path.startsWith("/auth/");
  const isPendingPage = path === "/users/pending";
  const isPublic = isPublicPath(path);

  // Authenticated users hitting an auth route bounce to the staff dashboard.
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public routes are always accessible — skip the rest of the middleware
  // so anon visitors can browse /, /news, /jobs, /privacy freely.
  if (isPublic) {
    return response;
  }

  // From here on, the path is staff-side. Force a login when no session.
  if (!user && !isAuthCallback && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Profile-status enforcement on staff routes only.
  if (user && !isAuthRoute && !isAuthCallback) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      // Inactive users get signed out
      if (profile.status === "inactive") {
        await supabase.auth.signOut();
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "account_inactive");
        return NextResponse.redirect(loginUrl);
      }

      // Pending users are redirected to pending page
      if (profile.status === "pending" && !isPendingPage) {
        return NextResponse.redirect(new URL("/users/pending", request.url));
      }

      // Active users on pending page are redirected to the dashboard
      if (profile.status === "active" && isPendingPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}
