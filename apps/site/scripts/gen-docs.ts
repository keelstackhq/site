// Writes the generated docs pages from docs-src/ (`pnpm --filter @keelstackhq/site gen`).
// `--check` renders and formats into a temp dir and exits 1 when a committed copy differs.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { diffGenerated, generate } from "../src/lib/generate.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = join(root, ".gen-tmp");

/** Renders, then formats with `vp fmt` (tables re-align when a token changes width). */
function generateFormatted(): Map<string, string> {
  const map = generate();
  rmSync(tmp, { recursive: true, force: true });
  try {
    for (const [path, content] of map) {
      mkdirSync(dirname(join(tmp, path)), { recursive: true });
      writeFileSync(join(tmp, path), content);
    }
    execFileSync("vp", ["fmt", ".gen-tmp"], { cwd: root, stdio: "pipe" });
    return new Map([...map.keys()].map((p) => [p, readFileSync(join(tmp, p), "utf8")]));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const read = (p: string): string | undefined => {
  try {
    return readFileSync(join(root, p), "utf8");
  } catch {
    return undefined;
  }
};

const map = generateFormatted();
if (process.argv.includes("--check")) {
  const changed = diffGenerated(map, read);
  if (changed.length > 0) {
    console.error(`gen-docs: out of date:\n${changed.map((p) => `  ${p}`).join("\n")}`);
    console.error("Edit docs-src/ or versions.ts, then run: pnpm --filter @keelstackhq/site gen");
    process.exit(1);
  }
} else {
  for (const [p, c] of map) {
    mkdirSync(dirname(join(root, p)), { recursive: true });
    writeFileSync(join(root, p), c);
  }
}
