import { execFileSync } from "node:child_process";
import { expect, test } from "vite-plus/test";
import { diffGenerated } from "../lib/generate.ts";

test("committed generated docs match docs-src and versions.ts", () => {
  expect(() =>
    execFileSync("node", ["scripts/gen-docs.ts", "--check"], { stdio: "pipe", encoding: "utf8" }),
  ).not.toThrow();
});

const read = (p: string) => (p === "a.md" ? "one" : "changed");

test("diffGenerated returns the paths whose committed copy differs", () => {
  const map = new Map([
    ["a.md", "one"],
    ["b.md", "two"],
  ]);
  expect(diffGenerated(map, read)).toEqual(["b.md"]);
  expect(diffGenerated(map, () => undefined)).toEqual(["a.md", "b.md"]);
});
