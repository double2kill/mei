import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: "猜了湄",
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8655",
        pathRewrite: { "^/api": "" },
      },
    },
  },
});
