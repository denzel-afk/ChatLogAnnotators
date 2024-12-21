import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const userRole = req.cookies.get("userRole")?.value;

  // If no userRole is present, redirect to login
  if (!userRole) {
    if (!url.pathname.startsWith("/login")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Role-based access control
  if (userRole === "admin" && !url.pathname.startsWith("/admin")) {
    url.pathname = "/admin/home";
    return NextResponse.redirect(url);
  }

  if (userRole === "annotator" && !url.pathname.startsWith("/annotator")) {
    url.pathname = "/annotator/home";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // Apply middleware to admin routes
    "/annotator/:path*", // Apply middleware to annotator routes
    "/", // Apply middleware to root
  ],
};
