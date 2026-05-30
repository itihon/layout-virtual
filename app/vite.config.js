import { resolve } from "node:path";
import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const root = import.meta.dirname;

export default defineConfig(({ mode }) => {
  if (mode === "development") {
    return {
      root: "./src/",
      server: {
        host: "0.0.0.0",
      },
      resolve: {
        alias: {
          // Map the package names directly to their raw source code
          'layout-virtual': path.resolve(__dirname, '../packages/layout-virtual/src/index.ts'),
          'layout-virtual/core': path.resolve(__dirname, '../packages/layout-virtual/src/core.ts'),
          'react-layout-virtual': path.resolve(__dirname, '../packages/react-layout-virtual/src/index.ts'),
          'vue-layout-virtual': path.resolve(__dirname, '../packages/vue-layout-virtual/src/index.ts'),
          'angular-layout-virtual': path.resolve(__dirname, '../packages/angular-layout-virtual/src/index.ts'),
        },
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
