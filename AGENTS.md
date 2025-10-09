# Repository Guidelines

This document is a concise contributor guide for this repository. It outlines project layout, common workflows, and coding expectations to keep changes small, readable, and easy to review.

## Project Structure & Module Organization
- `src/` – main application code (modules, services, utilities).
- `tests/` – automated tests mirroring `src/` structure (e.g., `tests/module_test.py` or `tests/module.spec.ts`).
- `scripts/` – maintenance/dev scripts (format, lint, release).
- `assets/` or `docs/` – static files and docs.
Keep modules focused; prefer small files and clear names (e.g., `user_service`, `guildCommands`, `health_check`).

## Build, Test, and Development Commands
- JavaScript/TypeScript: `npm i`, `npm run dev` (watch), `npm test`, `npm run build`.
- Python: `python -m venv .venv && . .venv/bin/activate`, `pip install -r requirements.txt`, `pytest -q`.
- Makefile (if present): `make test`, `make lint`, `make run`.
Use the commands defined in `package.json`, `Makefile`, or project scripts when they exist.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (JS/TS) or 4 spaces (Python); no tabs.
- Naming: modules `snake_case` (Python) or `kebab-case` (files, JS), classes `PascalCase`, functions/vars `camelCase` (JS) or `snake_case` (Python).
- Formatting/Linting: use configured tools if present (e.g., Prettier/ESLint or Black/Ruff). Run `npm run lint` or `scripts/format.*` before opening a PR.

## Testing Guidelines
- Co-locate tests in `tests/` mirroring `src/` paths.
- Naming: Python `test_*.py`; JS `*.spec.ts`/`*.test.ts`.
- Aim for meaningful coverage on business logic and error paths; include a failing test before fixing a bug.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits where possible (e.g., `feat: add health-check route`, `fix: handle missing token`). Keep commits small and focused.
- PRs: include description, rationale, screenshots/logs when relevant, and linked issues. Ensure CI is green and code is formatted/linted.

## Security & Configuration Tips
- Never commit secrets; use environment variables (e.g., `.env`) for tokens/keys. Example: `DISCORD_TOKEN=...`.
- Document required env vars in the README and provide safe examples.

## Agent-Specific Notes
- Keep diffs minimal and adhere to existing patterns.
- Prefer `rg` for search, run targeted tests, and update this guide if conventions change.

