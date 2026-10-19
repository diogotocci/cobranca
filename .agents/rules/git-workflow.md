---
trigger: always_on
description: Branch, commit, push and pull request workflow for every change.
---

# Git workflow

`main` is protected by review: every change reaches it through a pull request that the owner reviews and merges. The agent never pushes to `main` and never merges.

## Starting a task

1. `git status --short`. Never discard, stash or commit changes you did not make (`reset --hard`, `clean -fd`, `checkout -- .`, `restore .`, `stash`); if unrelated changes are present and you cannot tell whose they are, ask.
2. Branch from the latest `origin/main`. In a cloud session that assigns a branch name, use that branch. Otherwise name it `<type>/<short-kebab-description>` with `feature/`, `fix/`, `refactor/`, `chore/` or `test/`.
3. Follow-ups that belong to the same task stay on the same branch and PR. A merged PR is finished: new work starts a new branch from `main`.

## During the task

Only task-related changes. Test-first (`coding-standards.md`). Run `pnpm check` before every commit.

## Commit

- Conventional Commits in English: `feat: add swipe-to-kick input`, `fix: clamp shot power`, `chore: set up lint and tests`.
- Review `git status` and `git diff` first, stage files explicitly, then review `git diff --cached`. Use `git add -A` only after every changed file was reviewed.
- No AI attribution of any kind (`coding-standards.md`): strip any `Co-Authored-By` or session trailer a tool adds.
- Author and committer are the owner: `Diogo Tocci <2313839+diogotocci@users.noreply.github.com>`. Cloud sessions set it at start (`.agents/hooks/session-start.sh`); before the first commit, check `git config user.name` and `git log -1 --format='%an <%ae> / %cn <%ce>'` and fix the identity if it is anything else.

## Pull request

Push the branch and open a pull request against `main` (draft while work is in progress), with the owner as reviewer. The body says what changed and why, how it was tested, and the new `package.json` version. Keep the PR green: fix CI failures and answer review comments. The owner merges.
