import { expect, test } from "vite-plus/test";
import { installBlock } from "../data/scenarios.ts";
import { docRefs, versions } from "../data/versions.ts";
import { buildCtx, renderTemplate } from "./render.ts";

const v = versions;
const ctx = buildCtx();

test("replaces a token", () => {
  expect(renderTemplate("splice {{ks.splice}}", ctx, "x.md")).toBe(`splice ${v.splice}`);
});

test("block tokens render the fenced builder output", () => {
  expect(renderTemplate("{{ks.block.installBlock}}", ctx, "x.md")).toBe(
    "```bash\n" + installBlock(v) + "\n```",
  );
});

test("derived keys", () => {
  expect(ctx["bare.hull"]).toBe(v.hull.replace(/^v/, ""));
  expect(ctx["short.bosun"]).toHaveLength(7);
  expect(ctx["ref.bosunSpec"]).toBe(docRefs.bosunSpec);
  expect(ctx["ref.spliceAction"]).toBe(docRefs.spliceAction);
  expect(ctx.verified).toContain("Last verified");
  expect(ctx["block.adoptHullBlock"]).toBeUndefined();
  const withAssess = buildCtx(v, { ...docRefs, assessUrl: "/assess/a.mjs", assessSha: "abc" });
  expect(withAssess["block.adoptHullBlock"]).toContain("/assess/a.mjs");
});

test("GitHub expressions pass through", () => {
  const s = "token: ${{ secrets.X }}";
  expect(renderTemplate(s, ctx, "x.md")).toBe(s);
});

test("unknown token throws with file and line", () => {
  expect(() => renderTemplate("a\nb\nc {{ks.nope}}", ctx, "x.md")).toThrow(
    "gen-docs: unknown token {{ks.nope}} in docs-src/x.md:3",
  );
});

test("output has no tokens left", () => {
  expect(renderTemplate("{{ks.hull}} {{ks.bosun}}", ctx, "x.md")).not.toContain("{{ks.");
});
