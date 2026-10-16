import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const html = readFileSync(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
assert(!/<script\b[^>]*\bsrc\s*=/i.test(html), "Scripts must be embedded");
assert(
  !/<link\b[^>]*\brel="(?:stylesheet|modulepreload)"/i.test(html),
  "Styles and modules must be embedded",
);
assert(
  html.includes("蛊真人杀") &&
    html.includes("升仙对决") &&
    html.includes("经典身份局") &&
    html.includes("<style>") &&
    html.includes('<script type="module">'),
  "Missing game bundle",
);
const cultivation = readFileSync(new URL('../dist/CULTIVATION.json',import.meta.url),'utf8');
assert(JSON.parse(cultivation).version==='2.0.0','Missing new-mode design manifest');
console.log(
  `Standalone HTML verified: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, no external scripts or styles.`,
);
