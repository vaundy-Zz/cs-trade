import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig(async () => {
  const react = (await import("@vitejs/plugin-react"))?.default;

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
