// FILE: vite.lib.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/vanilla/index.ts"),
      formats: ["es", "cjs", "umd"],
      name: "AsciiShader",
      fileName: (format) => {
        if (format === "es") return "ascii-shader.js";
        if (format === "cjs") return "ascii-shader.cjs";
        return "ascii-shader.umd.js";
      },
    },
    rollupOptions: {
      output: {},
    },
    sourcemap: true,
    emptyOutDir: false,
  },
});
