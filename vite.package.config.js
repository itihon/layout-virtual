import { resolve } from "node:path";
import { defineConfig } from "vite";

export function definePackageConfig({ packageDir, plugins = [], external = [], entries = [] }) {
  return defineConfig({
    build: {
      sourcemap: true,
      copyPublicDir: false,
      emptyOutDir: true,
      minify: "terser",
      lib: {
        entry: [resolve(packageDir, "src/index.ts"), ...entries],
        fileName: (_, entryName) => `${entryName}.js`,
        formats: ["es"],
      },
      rollupOptions: {
        external,
      },
      terserOptions: {
        mangle: {
          properties: {
            keep_quoted: true,
            regex: /^_/,
          },
        },
        nameCache: {},
      },
    },
    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },
    plugins,
  });
}
