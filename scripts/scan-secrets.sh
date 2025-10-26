#!/usr/bin/env bash
set -euo pipefail

red() { printf "\033[31m%b\033[0m" "$1"; }

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT_DIR"

PATTERNS=(
  # OpenAI-style keys
  'sk-[A-Za-z0-9_-]{20,}'
  # Explicit env assignments (avoid matching placeholders like sk-xxx)
  '^\s*LLM_API_KEY=.{24,}'
  '^\s*OPENAI_API_KEY=.{24,}'
)

EXCLUDES=(
  'node_modules'
  '.next'
  '.git'
  'playwright-report'
  'test-results'
  'coverage'
)

exclude_args=()
for e in "${EXCLUDES[@]}"; do
  exclude_args+=("--glob" "!$e/**")
done

FOUND=0
while IFS= read -r -d '' file; do
  for pat in "${PATTERNS[@]}"; do
    # shellcheck disable=SC2086
    if rg -n --pcre2 "${exclude_args[@]}" -e "${pat}" "$file" 2>/dev/null; then
      FOUND=1
    fi
  done
done < <(git ls-files -z)

if [[ "$FOUND" -ne 0 ]]; then
  echo
  red "Potential secrets detected. Aborting.\n"
  echo "If these are false positives, adjust scripts/scan-secrets.sh patterns."
  exit 1
fi

echo "No obvious secrets found in tracked files."
