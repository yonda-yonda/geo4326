import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    transform: "src/transform.ts",
    simplify: "src/simplify.ts",
    flatten: "src/flatten.ts",
    terminator: "src/terminator.ts",
    calc: "src/calc.ts",
    spheroid: "src/spheroid.ts",
    satellite: "src/satellite.ts",
    utils: "src/utils.ts",
    crs: "src/crs.ts",
    constants: "src/constants.ts",
    errors: "src/errors.ts",
    types: "src/types.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  outDir: "dist",
  splitting: false,
});
