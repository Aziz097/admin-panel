import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiAuthPrefix, authRoutes, publicRoutes } from "@/routes"

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith("/*")) {
      const base = route.replace("/*", "");
      return nextUrl.pathname.startsWith(base + "/");
    }
    return nextUrl.pathname === route;
  });

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};