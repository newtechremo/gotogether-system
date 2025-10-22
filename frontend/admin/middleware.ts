import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요 없는 공개 경로
const publicPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 토큰 확인 (쿠키 또는 헤더에서)
  const token = request.cookies.get("admin_token")?.value;

  // 로그인 상태 확인
  const isAuthenticated = !!token;

  // 루트 경로(/) 처리: 인증 상태에 따라 적절한 페이지로 리다이렉트
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 공개 경로인지 확인
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 보호된 경로에 인증되지 않은 사용자가 접근하려는 경우 로그인 페이지로 리다이렉트
  if (!isPublicPath && !isAuthenticated) {
    // 원래 요청한 URL을 저장하여 로그인 후 돌아갈 수 있도록
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
