import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true,
  },
  external: ["express"],
  plugins: [typescript(), terser()],
};

export default config;
