import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { cultivationMarkdown, cultivationPayload } from "./src/cultivationDesign";
// Keep the game fully offline and double-clickable without a runtime server.
function standalone(): Plugin {
  return {
    name: "standalone-html",
    enforce: "post",
    generateBundle(_options, bundle) {
      const page = bundle["index.html"];
      if (!page || page.type !== "asset") throw new Error("Missing HTML entry");
      let html = String(page.source);
      for (const [file, asset] of Object.entries(bundle)) {
        if (asset.type === "chunk" && asset.isEntry) {
          if (asset.imports.length || asset.dynamicImports.length)
            throw new Error("Standalone build cannot have external chunks");
          html = html.replace(
            /<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>/,
            () =>
              `<script type="module">${asset.code.replace(/<\/script/gi, "<\\/script")}</script>`,
          );
          delete bundle[file];
        } else if (asset.type === "asset" && file.endsWith(".css")) {
          html = html.replace(
            /<link\b[^>]*\brel="stylesheet"[^>]*>/,
            () =>
              `<style>${String(asset.source).replace(/<\/style/gi, "<\\/style")}</style>`,
          );
          delete bundle[file];
        }
      }
      page.source = html;
      this.emitFile({type:'asset',fileName:'CULTIVATION.md',source:cultivationMarkdown()});
      this.emitFile({type:'asset',fileName:'CULTIVATION.json',source:JSON.stringify(cultivationPayload(),null,2)});
    },
  };
}
export default defineConfig({
  base: "./",
  plugins: [react(), standalone()],
  build: { target: "es2020" },
});
