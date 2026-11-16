// Renders docs-src templates: `{{ks.NAME}}` tokens become values from the one version source.
// Imports only versions.ts and scenarios.ts (with .ts extensions) so Node can run it directly.
import * as sc from "../data/scenarios.ts";
import { bare, docRefs, tagCommits, verifiedLine, verifiedOn, versions } from "../data/versions.ts";

export type Ctx = Record<string, string>;

type Refs = typeof docRefs & { assessUrl?: string; assessSha?: string };

const fence = (body: string): string => "```bash\n" + body + "\n```";

export function buildCtx(
  v: typeof versions = versions,
  refs: Refs = docRefs,
  commits: Record<keyof typeof versions, string> = tagCommits,
  verified: string = verifiedOn,
): Ctx {
  const ctx: Ctx = {};
  for (const t of Object.keys(v) as (keyof typeof versions)[]) {
    ctx[t] = v[t];
    ctx[`bare.${t}`] = bare(v[t]);
    ctx[`commit.${t}`] = commits[t];
    ctx[`short.${t}`] = commits[t].slice(0, 7);
  }
  ctx["ref.bosunSpec"] = refs.bosunSpec;
  ctx["ref.spliceAction"] = refs.spliceAction;
  ctx.verified = verifiedLine(v, verified);
  // One line per builder; add new ones here.
  const blocks: Record<string, string> = {
    installBlock: sc.installBlock(v),
    newRepoBlock: sc.newRepoBlock(v),
    hoistBlock: sc.hoistBlock(v),
    adoptBosunBlock: sc.adoptBosunBlock,
    upgradeBlock: sc.upgradeBlock(v),
    approveBlock: sc.approveBlock,
  };
  if (refs.assessUrl && refs.assessSha) {
    ctx["assess.url"] = refs.assessUrl;
    ctx["assess.sha"] = refs.assessSha;
    blocks.adoptHullBlock = sc.adoptHullBlock(v, refs.assessUrl, refs.assessSha);
  }
  for (const [name, body] of Object.entries(blocks)) ctx[`block.${name}`] = fence(body);
  return ctx;
}

export function renderTemplate(src: string, ctx: Ctx, file: string): string {
  return src.replace(/\{\{ks\.([^}]*)\}\}/g, (token, name: string, offset: number) => {
    const value = ctx[name];
    if (value === undefined) {
      const line = src.slice(0, offset).split("\n").length;
      throw new Error(`gen-docs: unknown token ${token} in docs-src/${file}:${line}`);
    }
    return value;
  });
}
