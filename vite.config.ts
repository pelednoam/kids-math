import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

function versionJsonPlugin(): Plugin {
  return {
    name: "version-json",
    buildStart() {
      const data = JSON.stringify({ buildTime: new Date().toISOString() });
      mkdirSync(resolve(__dirname, "public"), { recursive: true });
      writeFileSync(resolve(__dirname, "public/version.json"), data);
    },
  };
}

const buildTime = new Date().toISOString();

export default defineConfig({
  plugins: [react(), versionJsonPlugin()],
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  server: {
    port: 5173,
    open: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-setup.ts",
  },
});
