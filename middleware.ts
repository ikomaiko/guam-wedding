// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authUser = request.cookies.get("auth-user");
  const isLoginPage = request.nextUrl.pathname === "/login";

  // ログインページにいる場合
  if (isLoginPage) {
    // すでにログインしている場合はホームにリダイレクト
    if (authUser) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 他のページにいて、ログインしていない場合はログインページへ
  if (!authUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
