import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        portfolio: resolve(__dirname, "index.html"),
        emath: resolve(__dirname, "emath.html"),
        khmerArchive: resolve(__dirname, "khmer-archive.html"),
        current: resolve(__dirname, "current.html"),
        wristBand: resolve(__dirname, "wrist-band.html"),
        drone: resolve(__dirname, "drone.html"),
      },
    },
  },
});
