import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieOption = { name: string; value: string; options?: object };

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

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

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path === "/login" || path === "/sign-up" || path === "/forgot-password";
  const isAuthCallback = path.startsWith("/auth/");
  const isPendingPage = path === "/users/pending";

  // Redirect authenticated users away from auth routes
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login
  if (!user && path === "/" && !isAuthCallback) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check user profile status for authenticated users on protected routes
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

      // Active users on pending page are redirected to dashboard
      if (profile.status === "active" && isPendingPage) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}
