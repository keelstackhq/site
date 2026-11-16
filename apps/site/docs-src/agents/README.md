# keelstack: agent guide

You are an AI agent in the TARGET repo (the one to set up, adopt, upgrade or move to a new mode), not in the keelstack repo. Read this file in full, then follow it. Do not invent commands: where this file says `TODO(copy)`, ask the owner.

## Use

Current versions: hull {{ks.hull}}, splice {{ks.splice}}, bosun {{ks.bosun}}, hoist {{ks.hoist}}, hoard {{ks.hoard}}, berth {{ks.berth}}. Machine-readable: https://keelstack.dev/agents/versions.json. {{ks.verified}}

bosun prints exactly one JSON object on stdout: `{version, command, ok, exit_code, data, error, next}`; `error` is `{kind, message, fix}`. Do what `error.fix` says. Make the calls in `next`. Never work around a refusal. Exit codes: 0 ok, 1 error, 2 usage, 3 conflict, 4 halted, 5 needs-human, 6 limit. On exit 5 stop and tell the owner what is needed.

## Decide

1. Empty repo or no commits: path A (new repo).
2. Existing repo with `.splice/` or `.bosun/version`: path D (upgrade). Mode change only: path C.
3. Other existing repo: run the assess block of path B. Read `template` and `stack` in its JSON (schema `hull.assess/1`; the fields are in the table at https://raw.githubusercontent.com/keelstackhq/hull/{{ks.hull}}/docs/adopt.md, not copied here).
   - `template` is `template` or `template-rust`: hull adopt (B). Then bosun init with the printed `stack`.
   - `template` is null: channels only (the decisions channel). Add bosun only when `stack` is `rust` or `ts-pnpm`.
   - `confidence` low: ask the owner each `unsure` question. Never guess.

## Human-only steps

Do these first. Tell the owner the whole list at once (D-009); the owner may answer in one message ("approve A B C"). After each, run its check and go on only when it passes.

| Step                                                 | Where          | Agent check                                                               |
| ---------------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| Create and push the GitHub repo                      | phone/computer | `gh repo view`                                                            |
| Install the Claude GitHub App on the repo            | phone/computer | TODO(copy): no machine check seen in `--help`; ask the owner              |
| Approve the setup PR's head and merge it             | phone/computer | `gh pr view --json state`                                                 |
| `hoist apply --area github` (needs admin rights)     | computer       | `hoist check`                                                             |
| Paste the cloud environment's setup script (Start E) | computer       | TODO(copy): no machine check seen in `--help`; `bosun doctor` lists steps |
| `bosun keygen --enroll` for the signing session      | computer       | `bosun doctor`                                                            |

{{ks.block.humanChecksBlock}}

## Steps

Install bosun first (every path assumes it):

{{ks.block.installBlock}}

Needs git, Node and `gh auth login`. Work on a branch in a clean checkout. Each block is exact; take `<placeholders>` from the owner or the JSON above. Each path ends with the Verify block.

A. New repo. Write `plans/<name>.md` from the owner's brief and `bosun plan check` it before `bosun init`. Use `//template-rust` and `--stack rust` for Rust.

{{ks.block.newRepoBlock}}

After the owner merges the setup PR, the owner runs:

{{ks.block.hoistBlock}}

B. Adopt, with hull. Take `<template>` and each `<id>:<name>` from the assess JSON (`next`, `pieces`). Read the dry run's change list, then run the same splice command without `--dry-run`. Never pass `--force` unless the owner names the files it may replace. Open the PR; the owner merges it. Then bosun init (A) for `rust` or `ts-pnpm`, and hoist with `--adopt` on an existing repo.

{{ks.block.adoptHullBlock}}

B. Adopt, with bosun alone (no hull, no splice):

{{ks.block.adoptBosunBlock}}

C. Change mode. Needs bosun 0.15.0 or later in the repo. One rung per PR unless the owner says `--direct`; the owner approves the PR head.

{{ks.block.migrateBlock}}

D. Upgrade. bosun first, then hull, each its own PR. A repo with `.splice/channels/bosun.toml` cannot run `bosun pin` (it refuses): there `splice update --all` also moves bosun; skip the pin lines.

{{ks.block.upgradeBlock}}

Approvals (R-gov and other owner-class PRs): the owner approves the exact head SHA.

{{ks.block.approveBlock}}

## Verify

Run after each step; all must pass. `splice check` exits 1 also when an update is available: that is not a failure of your change, report it.

{{ks.block.verifyBlock}}

## Rollback

Nothing is merged until the owner merges it. `--dry-run` writes nothing. Before a merge, drop the branch or close the PR; after a mode move to a looser mode, go tighter in one PR.

{{ks.block.rollbackBlock}}

## Sources

- This file: https://raw.githubusercontent.com/keelstackhq/keelstack/main/agents/README.md (also https://keelstack.dev/agents.md)
- One scenario each (Setup plus its block): https://keelstack.dev/docs/start/a.md to https://keelstack.dev/docs/start/f.md
- hull adopt guide at the tag: https://raw.githubusercontent.com/keelstackhq/hull/{{ks.hull}}/docs/adopt.md
