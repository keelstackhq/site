# keelstack: agent guide

You are an AI agent in the TARGET repo (to set up, adopt, upgrade or move to a new mode), not in keelstack. Read this file in full, then follow it. Never invent commands: at a `TODO(copy)`, ask the owner.

## Use

Versions: hull {{ks.hull}}, splice {{ks.splice}}, bosun {{ks.bosun}}, hoist {{ks.hoist}}, hoard {{ks.hoard}}, berth {{ks.berth}}. Machine-readable: https://keelstack.dev/agents/versions.json. {{ks.verified}}

bosun prints exactly one JSON object on stdout: `{version, command, ok, exit_code, data, error, next}`; `error` is `{kind, message, fix}`. Do what `error.fix` says; make the calls in `next`; never work around a refusal. Exit codes: 0 ok, 1 error, 2 usage, 3 conflict, 4 halted, 5 needs-human, 6 limit. On exit 5 stop and tell the owner what is needed.

## Decide

First match wins.

1. Empty repo or no commits: path A.
2. `.bosun/version` exists and the owner asks for a mode change: path C (checked before D). No `.bosun/version`: set bosun up first (B).
3. `.splice/` or `.bosun/version`: path D (upgrade).
4. Otherwise run the assess block of path B. Read `template` in its JSON (schema `hull.assess/1`: fields in the hull adopt guide, Sources). `stack` is null whenever `template` is null.
   - `template` is `template` or `template-rust`: hull adopt (B), then `bosun init` with the printed `stack`.
   - `template` is null: channels only (B). For bosun too, or when the owner declines hull but wants bosun: bosun alone (`bosun adopt`, B; stack detected, `--stack rust|ts-pnpm|other` overrides).
   - `confidence` low: ask the owner each `unsure` question; never guess.

## Human-only steps

Tell the owner the whole list at once (D-009); one message may answer all. You run everything else, `gh repo create` included. After each step run its check; go on only when it passes.

{{ks.humanSteps.table}}

{{ks.humanSteps.note}}

## Steps

Install bosun first (every path assumes it):

{{ks.block.installBlock}}

Needs git, Node, `gh auth login` (A also pnpm). Work on a branch in a clean checkout. Blocks are exact; take `<placeholders>` from the owner or the JSON above. Each path ends with Verify.

A. New repo. The owner's brief gives the repo name, `<owner>`, the pieces (`<id>:<name>`, e.g. `preact-app`, `hono-worker`) and the plan. After `splice new`, write `plans/<name>.md` from the brief, `bosun plan check` it; `bosun init --plan` copies it. Rust: `//template-rust`, `--stack rust`, piece `rust-cli` (library crates need none); skip the pnpm lines (TODO(copy): its check command).

{{ks.block.newRepoBlock}}

Owner step 4, after the merge:

{{ks.block.hoistBlock}}

B. Adopt, with hull. Take `<template>` and each `<id>:<name>` from the assess JSON (`next`, `pieces`). The owner confirms them and reads the dry run's change list.

{{ks.block.adoptHullBlock}}

Then run it for real and check. Never `--force` unless the owner names the files to replace. Their `ci.yml` is an owned clash (refused): the owner takes the template's or keeps theirs and renames its job `ci-ok`; a kept owned workflow stays refused, so then adopt later or channels only (hull adopt guide).

{{ks.block.adoptHullRunBlock}}

Open the PR; the owner merges it. Then `bosun init --stack <stack> --plan plans/<name>.md --owner <login>` (`stack` from assess; plan from the owner's brief, as in A), then owner step 4 with `--adopt`:

{{ks.block.hoistAdoptBlock}}

B. Adopt, channels only (no hull template; then optionally bosun):

{{ks.block.channelsBlock}}

B. Adopt, with bosun alone (no hull, no splice; no plan yet: after `bosun doctor` write `plans/<name>.md` from the owner's brief and `bosun plan check` it):

{{ks.block.adoptBosunBlock}}

C. Change mode. Needs bosun 0.15.0 or later in the repo. No `bosun init`, no new plan: `--finish` amends the plans of open epics (`--plan <file>` adds one). One rung per PR unless the owner says `--direct`; the owner approves the PR head.

{{ks.block.migrateBlock}}

D. Upgrade. bosun first, then hull, each its own PR. With `.splice/channels/bosun.toml` `bosun pin` refuses: `splice update --all` also moves bosun; skip the pin and npm lines and install the version in `.bosun/version`.

{{ks.block.upgradeBlock}}

Approvals (R-gov and other owner-class PRs): the owner approves the exact head SHA.

{{ks.block.approveBlock}}

## Verify

Run each check when its step is done. A red `pnpm run ci` is yours to fix. `splice check` also exits 1 when an update is available (not your change's failure).

{{ks.block.verifyBlock}}

## Rollback

Nothing is merged until the owner merges it. `--dry-run` writes nothing.

{{ks.block.rollbackBlock}}

## Sources

- This file: https://raw.githubusercontent.com/keelstackhq/keelstack/main/agents/README.md (also https://keelstack.dev/agents.md)
- One scenario each: https://keelstack.dev/docs/start/a.md to f.md
- hull adopt guide at the tag: https://raw.githubusercontent.com/keelstackhq/hull/{{ks.hull}}/docs/adopt.md
