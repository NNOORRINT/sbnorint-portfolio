import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/sbnorint-portfolio/",
  build: {
    rollupOptions: {
      input: {
        portfolio: resolve(__dirname, "index.html"),
        emath: resolve(__dirname, "emath.html"),
        lumhat: resolve(__dirname, "lumhat.html"),
        current: resolve(__dirname, "current.html"),
        wristBand: resolve(__dirname, "wrist-band.html"),
        drone: resolve(__dirname, "drone.html"),
      },
    },
  },
});
