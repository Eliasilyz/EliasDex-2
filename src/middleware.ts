import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth?.token?.role as string | undefined;
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-auth-secret-for-build-purposes-only-eliasdex2",
  }
);

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"],
};
