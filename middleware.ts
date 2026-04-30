import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = (req.auth?.user as { role?: string })?.role === "ADMIN";

  // Use req.nextUrl (honours x-forwarded-host on Vercel) — never use req.url
  // which can resolve to the internal localhost proxy address.
  const loginUrl = new URL("/auth/login", origin);

  if (pathname.startsWith("/admin") && !isAdmin) {
    return Response.redirect(loginUrl);
  }

  const protectedPaths = ["/orders", "/profile", "/checkout"];
  if (protectedPaths.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*", "/profile/:path*", "/checkout/:path*"],
};
