import { cpSync } from "node:fs";

// Vite fingerprints images referenced by <img>, but project pages also link
// directly to the original files so visitors can open them at full size.
cpSync("assets", "dist/assets", { recursive: true });
