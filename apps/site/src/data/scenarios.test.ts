import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { buildLlmsTxt } from "../lib/llms";
import { pickPath } from "./content";
import {
  ADOPT_BOSUN_OWNER,
  adoptBosunBlock,
  adoptHullBlock,
  APPROVE_COMMENT,
  APPROVE_HOW,
  cliBlock,
  CLOUD_TOML,
  MIGRATE_COMMANDS,
  newRepoBlock,
  NETWORK,
  NEW_REPO_OWNER,
  NO_APPROVAL,
  OWNER_APPROVES,
  SETUP_SHORT,
  SIGNER_STEPS,
  SLACK_COMMANDS,
  SLACK_NOTIFY_DIGEST,
  SLACK_TOML,
  scenarios,
} from "./scenarios";
import { versions } from "./versions";

const read = (rel: string) => readFileSync(new URL(`../pages/${rel}`, import.meta.url), "utf8");
const start = read("docs/start.md");
const risk = read("docs/risk.md");
const cloud = read("docs/cloud.md");
const adopt = read("docs/adopt.md");
const adoptSrc = JSON.parse(
  readFileSync(new URL("./hull/adopt.json", import.meta.url), "utf8"),
) as { assess: { url: string; sha256: string } };

const lines = (block: string) => block.split("\n");

test("scenarios a to f, each with an anchor on /docs/start and a landing card", () => {
  expect(scenarios.map((s) => s.id)).toEqual(["a", "b", "c", "d", "e", "f"]);
  for (const s of scenarios) expect(start).toContain(`<a id="${s.id}"></a>`);
  expect(pickPath.cards.map((c) => c.href)).toEqual(scenarios.map((s) => `/docs/start/#${s.id}`));
});

test("every code block of /docs/start is at most 12 lines", () => {
  for (const block of start.split("```").filter((_, i) => i % 2 === 1)) {
    expect(block.trim().split("\n").length - 1).toBeLessThanOrEqual(12);
  }
});

test("/docs/start carries the shared blocks", () => {
  const blocks = [
    newRepoBlock(versions),
    adoptHullBlock(versions, adoptSrc.assess.url, adoptSrc.assess.sha256),
    adoptBosunBlock(versions),
    cliBlock(versions),
    SETUP_SHORT,
    SLACK_TOML,
    SLACK_COMMANDS,
  ];
  for (const b of blocks) for (const l of lines(b)) expect(start).toContain(l);
  for (const l of lines(MIGRATE_COMMANDS)) expect(start).toContain(l.split("   #")[0]);
  for (const t of [
    NEW_REPO_OWNER,
    ADOPT_BOSUN_OWNER,
    NETWORK,
    NO_APPROVAL,
    OWNER_APPROVES,
    ...APPROVE_HOW,
  ]) {
    expect(start).toContain(t.replace(/`/g, ""));
  }
  expect(start).toContain(APPROVE_COMMENT.replace("<40-character head SHA>", ""));
});

test("/docs/adopt leads with the same assess, splice adopt and bosun adopt blocks", () => {
  const head = adopt.split("## Use Claude")[0] ?? "";
  for (const b of [
    adoptHullBlock(versions, adoptSrc.assess.url, adoptSrc.assess.sha256),
    adoptBosunBlock(versions),
  ]) {
    expect(head).toContain(b);
  }
});

test("/docs/cloud has the short script first, the network note and [cloud] table", () => {
  expect(cloud.indexOf(SETUP_SHORT)).toBeGreaterThan(0);
  expect(cloud.indexOf(SETUP_SHORT)).toBeLessThan(cloud.indexOf("#!/usr/bin/env bash"));
  expect(cloud).toContain(NETWORK);
  expect(cloud).toContain(CLOUD_TOML);
});

test("/docs/risk has the cheat sheet, the 4 signer steps and the digest", () => {
  expect(risk).toContain(NO_APPROVAL);
  expect(risk).toContain(OWNER_APPROVES);
  expect(risk).toContain(APPROVE_COMMENT.replace("<40-character head SHA>", ""));
  expect(SIGNER_STEPS).toHaveLength(4);
  for (const [i, step] of SIGNER_STEPS.entries()) {
    expect(risk).toContain(
      `${i + 1}. ${step.startsWith("bosun ") ? `\`${step}\`` : step}`.replace(
        /`signer = true`/,
        "`signer = true`",
      ),
    );
  }
  expect(risk).toContain(SLACK_NOTIFY_DIGEST);
});

test("llms.txt: one line per scenario and one version line", () => {
  const out = buildLlmsTxt();
  for (const s of scenarios) expect(out).toContain(`- ${s.id.toUpperCase()}. ${s.title}:`);
  expect(out).toContain(
    `Current versions: hull ${versions.hull}, splice ${versions.splice}, bosun ${versions.bosun}, hoist ${versions.hoist}, hoard ${versions.hoard}, berth ${versions.berth}.`,
  );
});

test("no docs page that states a current version names an older hull or bosun", () => {
  const pages = [
    "start",
    "start-here",
    "getting-started",
    "greenfield-bosun",
    "cloud",
    "adopt",
    "index",
  ];
  for (const p of pages) {
    const text = read(`docs/${p}.md`);
    for (const [, v] of text.matchAll(/\bhull (v\d+\.\d+\.\d+)\b(?! and later)/g)) {
      // "hull v0.4.0 and later" style history is fine; a pin must be the current one.
      if (
        /--ref|render hull|rendered from hull|Latest releases/.test(
          text.slice(text.indexOf(`hull ${v}`) - 40, text.indexOf(`hull ${v}`)) +
            text.slice(text.indexOf(`hull ${v}`), text.indexOf(`hull ${v}`) + 20),
        )
      ) {
        expect(v, p).toBe(versions.hull);
      }
    }
    expect(text, p).not.toMatch(/--ref v0\.(?!10\.0)\d+\.\d+/);
    expect(text, p).not.toMatch(/@keelstackhq\/bosun@0\.(?!15\.0)\d+\.\d+/);
    expect(text, p).not.toMatch(/@keelstackhq\/hoist@0\.(?!4\.1)\d+\.\d+/);
  }
  expect(readdirSync(new URL("../pages/docs/", import.meta.url)).length).toBeGreaterThan(10);
});
