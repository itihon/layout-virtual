import { resolve } from "node:path";
import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const root = import.meta.dirname;
const packagesDir = path.resolve(__dirname, '../packages');

export default defineConfig(({ mode }) => {
  if (mode === "development") {
    return {
      root: "./src/",
      server: {
        host: "0.0.0.0",
      },
      esbuild: {
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true, // apply globally, regardless of tsconfig location
          },
        },
      },
      resolve: {
        alias: [
          // Core package routing
          {
            find: /^layout-virtual\/(.*)$/,
            replacement: path.join(packagesDir, 'layout-virtual/src/$1'),
          },
          {
            find: /^layout-virtual$/,
            replacement: path.join(packagesDir, 'layout-virtual/src/index.ts'),
          },

          // React package routing
          {
            find: /^react-layout-virtual\/(.*)$/,
            replacement: path.join(packagesDir, 'react-layout-virtual/src/$1'),
          },
          {
            find: /^react-layout-virtual$/,
            replacement: path.join(packagesDir, 'react-layout-virtual/src/index.ts'),
          },

          // Vue package routing
          {
            find: /^vue-layout-virtual\/(.*)$/,
            replacement: path.join(packagesDir, 'vue-layout-virtual/src/$1'),
          },
          {
            find: /^vue-layout-virtual$/,
            replacement: path.join(packagesDir, 'vue-layout-virtual/src/index.ts'),
          },
          
          // Angular package routing
          {
            find: /^angular-layout-virtual\/(.*)$/,
            replacement: path.join(packagesDir, 'angular-layout-virtual/src/$1'),
          },
          {
            find: /^angular-layout-virtual$/,
            replacement: path.join(packagesDir, 'angular-layout-virtual/src/index.ts'),
          },
        ],
      },
      plugins: [vue()],
    };
  } else {
    console.log('building app workspace...');

    return {
      root: "src",
      plugins: [vue()],
      build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
          input: {
            index: resolve(root, "src/index.html"),
            vanilla: resolve(root, "src/vanilla/index.html"),
            react: resolve(root, "src/react/index.html"),
            vue: resolve(root, "src/vue/index.html"),
            angular: resolve(root, "src/angular/index.html"),
          },
        },
      },
    };
  }
});
