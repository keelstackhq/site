# keelstack: agent guide

You are an AI agent in the TARGET repo (the one to set up, adopt, upgrade or move to a new mode), not in the keelstack repo. Read this file in full, then follow it. Do not invent commands: where this file says `TODO(copy)`, ask the owner.

## Use

Current versions: hull {{ks.hull}}, splice {{ks.splice}}, bosun {{ks.bosun}}, hoist {{ks.hoist}}, hoard {{ks.hoard}}, berth {{ks.berth}}. Machine-readable: https://keelstack.dev/agents/versions.json. {{ks.verified}}

bosun prints exactly one JSON object on stdout: `{version, command, ok, exit_code, data, error, next}`; `error` is `{kind, message, fix}`. Do what `error.fix` says. Make the calls in `next`. Never work around a refusal. Exit codes: 0 ok, 1 error, 2 usage, 3 conflict, 4 halted, 5 needs-human, 6 limit. On exit 5 stop and tell the owner what is needed.

## Decide

1. Empty repo or no commits: path A (new repo).
2. Existing repo that only needs a mode change: path C.
3. Existing repo with `.splice/` or `.bosun/version`: path D (upgrade).
4. Other existing repo: run the assess block of path B. Read `template` in its JSON (schema `hull.assess/1`; the fields are in the table at https://raw.githubusercontent.com/keelstackhq/hull/{{ks.hull}}/docs/adopt.md, not copied here). `stack` is null whenever `template` is null.
   - `template` is `template` or `template-rust`: hull adopt (B), then bosun init with the printed `stack`.
   - `template` is null: channels only (B, channels block). Add bosun only if the owner wants it, with `--stack rust` or `--stack ts-pnpm` as the owner chooses; other stacks take the decisions channel only.
   - `confidence` low: ask the owner each `unsure` question. Never guess.

## Human-only steps

Do these first. Tell the owner the whole list at once (D-009); the owner may answer in one message ("approve A B C"). After each, run its check and go on only when it passes.

| Step                                                 | Where          | Agent check                                                                                                    |
| ---------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| Create and push the GitHub repo                      | phone/computer | `gh repo view`                                                                                                 |
| Install the Claude GitHub App on the repo            | phone/computer | `bosun doctor` (step 2)                                                                                        |
| Approve the setup PR's head and merge it             | phone/computer | `gh pr view --json state`                                                                                      |
| `hoist apply --area github` (needs admin rights)     | computer       | `hoist check`                                                                                                  |
| Paste the cloud environment's setup script (Start E) | computer       | `bosun doctor` (step 6) checks only the repo file `docs/setup-script.sh`; the paste: TODO(copy), ask the owner |
| `bosun keygen --enroll` for the signing session      | computer       | `git show origin/HEAD:.bosun/approvers.toml` lists the key id                                                  |

{{ks.block.humanChecksBlock}}

## Steps

Install bosun first (every path assumes it):

{{ks.block.installBlock}}

Needs git, Node and `gh auth login`. Work on a branch in a clean checkout. Each block is exact; take `<placeholders>` from the owner or the JSON above. Each path ends with the Verify block.

A. New repo. Write `plans/<name>.md` from the owner's brief and `bosun plan check` it before `bosun init`. Use `//template-rust` and `--stack rust` for Rust.

{{ks.block.newRepoBlock}}

After the owner merges the setup PR, the owner runs:

{{ks.block.hoistBlock}}

B. Adopt, with hull. Take `<template>` and each `<id>:<name>` from the assess JSON (`next`, `pieces`). Read the dry run's change list, then run the same splice command without `--dry-run`. Never pass `--force` unless the owner names the files it may replace. Open the PR; the owner merges it. Then bosun init (A) for `rust` or `ts-pnpm`, and hoist with `--adopt` (block below, run by the owner).

{{ks.block.adoptHullBlock}}

{{ks.block.hoistAdoptBlock}}

B. Adopt, channels only (no hull template; after the PR merges, then optionally bosun):

{{ks.block.channelsBlock}}

B. Adopt, with bosun alone (no hull, no splice):

{{ks.block.adoptBosunBlock}}

C. Change mode. Needs bosun 0.15.0 or later in the repo. One rung per PR unless the owner says `--direct`; the owner approves the PR head.

{{ks.block.migrateBlock}}

D. Upgrade. bosun first, then hull, each its own PR. A repo with `.splice/channels/bosun.toml` cannot run `bosun pin` (it refuses): there `splice update --all` also moves bosun; skip the pin lines and the npm line below: install the version in `.bosun/version` instead.

{{ks.block.upgradeBlock}}

Approvals (R-gov and other owner-class PRs): the owner approves the exact head SHA.

{{ks.block.approveBlock}}

## Verify

Run each check when its step is done, not before. A red `pnpm run ci` is yours to fix. `bosun doctor` exit 5 means owner steps are pending: list them to the owner. `splice check --offline` needs `.splice/lock.toml` (not in a repo with no hull); without `--offline` it also exits 1 when an update is available, which is not a failure of your change. `hoist check` only after the owner's `hoist apply`.

{{ks.block.verifyBlock}}

## Rollback

Nothing is merged until the owner merges it. `--dry-run` writes nothing. Before a merge, drop the branch or close the PR; after a mode move to a looser mode, go tighter in one PR.

{{ks.block.rollbackBlock}}

## Sources

- This file: https://raw.githubusercontent.com/keelstackhq/keelstack/main/agents/README.md (also https://keelstack.dev/agents.md)
- One scenario each (Setup plus its block): https://keelstack.dev/docs/start/a.md to https://keelstack.dev/docs/start/f.md
- hull adopt guide at the tag: https://raw.githubusercontent.com/keelstackhq/hull/{{ks.hull}}/docs/adopt.md
