#!/bin/bash
# Prepares a Claude Code cloud session: installs dependencies and builds the
# graphify knowledge graph so lint, tests and graph queries work from the first prompt.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

GRAPHIFY_VERSION="0.9.92"

# Cloud containers come with a generic agent Git identity. Commits in this repository are
# authored by the owner (see .agents/rules/git-workflow.md), so set it for this clone.
git config user.name "Diogo Tocci"
git config user.email "2313839+diogotocci@users.noreply.github.com"

pnpm install --frozen-lockfile

if ! command -v graphify >/dev/null 2>&1 || ! graphify --version 2>/dev/null | grep -q "$GRAPHIFY_VERSION"; then
  uv tool install --force "graphifyy==${GRAPHIFY_VERSION}"
fi

graphify update . >/dev/null
echo "INFO session ready: dependencies installed, graphify graph built"
