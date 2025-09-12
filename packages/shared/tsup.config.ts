import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  minify: false,
  external: ["zod"],
  tsconfig: "./tsconfig.json",
});
