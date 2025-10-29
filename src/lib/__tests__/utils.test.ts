import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("should handle conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true && "true-class", false && "false-class")).toBe(
      "base true-class"
    );
  });

  it("should handle undefined and null", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });
});
