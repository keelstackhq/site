import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { expect, it } from "vite-plus/test";

// Budget from docs/agents/project.md: HTML + CSS + latin fonts for `/` stay at or under 150 KB.
// Measured on the build output; skipped when `dist` has not been built.
const dist = new URL("../../dist/", import.meta.url);
const built = existsSync(new URL("index.html", dist));
const BUDGET = 150 * 1024;

const read = (path: string): Uint8Array => readFileSync(new URL(path.replace(/^\//, ""), dist));
const text = (b: Uint8Array) => new TextDecoder().decode(b);
const gz = (b: Uint8Array) => gzipSync(b, { level: 9 }).length;

it.skipIf(!built)("keeps / (HTML + CSS gzipped + latin fonts) at or under 150 KB", () => {
  const html = read("/index.html");
  const css = [...text(html).matchAll(/<link[^>]+href="(\/[^"]+\.css)"/g)].map((m) => m[1]!);
  expect(css.length).toBeGreaterThan(0);
  // The browser fetches only the latin file of each family (unicode-range).
  const fonts = new Set<string>();
  for (const href of css) {
    const body = text(read(href));
    for (const m of body.matchAll(/url\((\/[^)]+-latin-(?!ext)[^)]*\.woff2)\)/g)) fonts.add(m[1]!);
  }
  expect(fonts.size).toBeGreaterThan(0);
  const total =
    gz(html) +
    css.reduce((n, h) => n + gz(read(h)), 0) +
    [...fonts].reduce((n, f) => n + read(f).length, 0);
  console.log(`budget: ${total} bytes of ${BUDGET} (${fonts.size} latin fonts)`);
  expect(total).toBeLessThanOrEqual(BUDGET);
});
