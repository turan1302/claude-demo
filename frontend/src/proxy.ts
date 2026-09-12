import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const PUBLIC_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has(AUTH_COOKIE_NAME);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!hasToken && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
