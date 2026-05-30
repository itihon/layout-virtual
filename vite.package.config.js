import { resolve } from "node:path";
import { defineConfig } from "vite";
import nameCache from './dist/name-cache.json' with { type: 'json' };
import { writeFileSync } from "node:fs";

const writeTerserNameCachePlugin = (path, cache) => ({
  name: 'write-terser-name-cache-plugin',
  closeBundle() {
    writeFileSync(path, JSON.stringify(cache, undefined, 3));
  }
});

export function definePackageConfig({ packageDir, plugins = [], external = [], entries = [] }) {
  const config = defineConfig({
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
        nameCache,
      },
    },
    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },
    plugins,
  });

  config.plugins.push(
    writeTerserNameCachePlugin(
      resolve(import.meta.dirname,'./dist/name-cache.json'),
      config.build.terserOptions.nameCache
    )
  );

  return config;
}
