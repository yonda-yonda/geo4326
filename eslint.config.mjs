import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "script/",
      "src/_generated/*",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
