import { auth } from "@/lib/auth";
import { getRedirectPath } from "@/lib/route-guard";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  const redirectPath = getRedirectPath(pathname, isAuthenticated);

  if (redirectPath) {
    const target = new URL(redirectPath, req.url);
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
