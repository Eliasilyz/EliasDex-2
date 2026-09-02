import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"],
};

export default withAuth(
  async function middleware(req) {
    // For admin routes, verify the freshest role from the DB so promotion
    // takes effect without requiring a re-login.
    if (req.nextUrl.pathname.startsWith("/admin")) {
      let role: string | undefined = req.nextauth?.token?.role as string | undefined;
      try {
        const uid = (req.nextauth?.token?.id as string) || "";
        const { findUserById } = await import("@/models/user");
        const fresh = await findUserById(uid);
        role = fresh?.role ?? role;
      } catch {
        // fall back to token role if DB lookup fails
      }
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
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
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  }
);
