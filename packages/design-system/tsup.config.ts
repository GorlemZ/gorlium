import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  // dts uses tsup's rollup-plugin-dts, which drives the classic `typescript`
  // (5.x) JS API. The native compiler (tsgo, used for `typecheck`) doesn't
  // expose that API yet, so this package keeps `typescript` as a devDependency
  // solely for emitting these declarations. Drop it once tsup supports native.
  dts: true,
  // Global CSS (tokens + component styles) is imported as a side effect from
  // src/index.ts and bundled by esbuild into dist/index.css.
});
