// Writes the generated docs pages after adopt.mjs or start-checklist.mjs rewrote a docs-src page,
// so a re-copy run leaves src/pages/docs current. Formatting is `pnpm gen`'s job (it runs vp fmt).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "../src/lib/generate.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function writeGenerated(): void {
  for (const [p, c] of generate()) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), c);
  }
}
