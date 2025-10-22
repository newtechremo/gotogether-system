import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get("facility_token")?.value;

  // Define public paths that don't require authentication
  const publicPaths = ["/login"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Redirect authenticated users away from login page
  const isAuthPath = pathname.startsWith("/login");
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login page
  if (!isPublicPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
