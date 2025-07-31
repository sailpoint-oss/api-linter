import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // enable Jest-style globals
    environment: "node", // use Node environment for tests
    include: ["packages/**/*.test.{ts,js}"], // pick up your test files
    exclude: ["**/node_modules/**", "**/dist/**", "build", "coverage"],
  },
});
