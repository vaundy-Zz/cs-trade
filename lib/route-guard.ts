export const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/preferences",
  "/alerts",
  "/watchlists",
];

export function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export function getRedirectPath(pathname: string, isAuthenticated: boolean) {
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    return `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`;
  }

  if (pathname.startsWith("/auth") && isAuthenticated) {
    return "/dashboard";
  }

  return null;
}
