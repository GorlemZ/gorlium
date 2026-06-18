import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  dts: true,
  // Global CSS (tokens + component styles) is imported as a side effect from
  // src/index.ts and bundled by esbuild into dist/index.css.
});
