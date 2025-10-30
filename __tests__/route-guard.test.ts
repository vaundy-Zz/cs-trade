import { isProtectedRoute, getRedirectPath } from "@/lib/route-guard";

describe("Route Guard", () => {
  describe("isProtectedRoute", () => {
    it("should identify protected routes correctly", () => {
      expect(isProtectedRoute("/dashboard")).toBe(true);
      expect(isProtectedRoute("/dashboard/settings")).toBe(true);
      expect(isProtectedRoute("/profile")).toBe(true);
      expect(isProtectedRoute("/preferences")).toBe(true);
      expect(isProtectedRoute("/alerts")).toBe(true);
      expect(isProtectedRoute("/watchlists")).toBe(true);
    });

    it("should identify public routes correctly", () => {
      expect(isProtectedRoute("/")).toBe(false);
      expect(isProtectedRoute("/auth/signin")).toBe(false);
      expect(isProtectedRoute("/auth/signup")).toBe(false);
      expect(isProtectedRoute("/about")).toBe(false);
    });
  });

  describe("getRedirectPath", () => {
    it("should redirect unauthenticated users from protected routes to signin", () => {
      const result = getRedirectPath("/dashboard", false);
      expect(result).toBe("/auth/signin?callbackUrl=%2Fdashboard");
    });

    it("should redirect authenticated users from auth pages to dashboard", () => {
      const result = getRedirectPath("/auth/signin", true);
      expect(result).toBe("/dashboard");
    });

    it("should return null for valid access", () => {
      expect(getRedirectPath("/", false)).toBeNull();
      expect(getRedirectPath("/dashboard", true)).toBeNull();
    });
  });
});
