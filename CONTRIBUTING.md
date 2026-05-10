# Contributing to @kolsetu-opensource/elba-mcp-server

Welcome! We're glad you're interested in contributing to the Elba MCP server. Whether you're fixing a bug, improving docs, or proposing a new tool — this guide will help you get started.

If you're looking for a good entry point, check out issues tagged [`good first issue`](https://github.com/Kolsetu-Opensource/elba-mcp-server/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## Before You Start

- **Bug fixes and documentation improvements** — Go ahead and open a PR directly.
- **New MCP tools or architectural changes** — Please [open an issue](https://github.com/Kolsetu-Opensource/elba-mcp-server/issues/new) first so we can discuss the design before you invest time writing code.

This keeps everyone aligned and avoids wasted effort.

## What We Accept

✅ **Always welcome:**

- Bug fixes
- Documentation improvements
- Test additions
- Developer experience (DX) improvements

⚠️ **Needs discussion first** (open an issue):

- New MCP tools
- Changes to the authentication flow
- Adding new dependencies

❌ **Not accepted:**

- Features that duplicate Elba's dashboard UI (the MCP server is a thin client, not a replacement for the dashboard)
- Server implementations for other platforms

## Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/Kolsetu-Opensource/elba-mcp-server.git
cd elba-mcp-server

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Run tests
npm test

# 5. Start the server in development mode
npm run dev
```

## Making Changes

1. **Branch from `main`** — Create a feature or fix branch off `main`.
2. **Write tests** — We use [vitest](https://vitest.dev/). Tests live in `__tests__/` and mirror the `src/` structure.
3. **Check everything before pushing:**

   ```bash
   npm run lint && npm run typecheck && npm test
   ```

4. **Add a changeset** — We use [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. Before pushing, run:

   ```bash
   npx changeset
   ```

   This will prompt you to describe your change and select a version bump type (patch, minor, or major). The changeset is committed with your PR and used to auto-generate release notes.

5. **Keep PRs small and focused** — One concern per PR makes review faster and history cleaner.

## PR Process

1. Open a pull request against `main`.
2. Fill out the PR template.
3. Wait for CI checks to pass.
4. A maintainer will review your PR — we aim to respond within a few business days.

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). All commit messages must follow this format:

```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`

Examples:
- `feat(tools): add deploy_widget tool`
- `fix(auth): handle expired token gracefully`
- `docs: update roadmap status`

Commits are validated locally via `commitlint` (enforced by a git hook).

## Code Style

- **ESLint** enforces our code style. Run `npm run lint` to check.
- **TypeScript strict mode** is enabled — all code must type-check cleanly.
- No manual formatting debates — the linter is the authority. If it passes, the style is correct.

## Reporting Bugs

Please use the [bug report issue template](https://github.com/Kolsetu-Opensource/elba-mcp-server/issues/new) and include:

- Which MCP client you're using (Claude Code, Cursor, VS Code, etc.)
- Your MCP client configuration (sanitize any tokens)
- Steps to reproduce the issue
- Expected vs. actual behavior

## Developer Certificate of Origin (DCO)

All contributions must include a `Signed-off-by` line in the commit message, certifying that you wrote or have the right to submit the code under the project's license.

```bash
git commit -s -m "feat(tools): add deploy_widget tool"
```

This adds a line like:
```
Signed-off-by: Your Name <your.email@example.com>
```

By signing off, you agree to the [Developer Certificate of Origin](https://developercertificate.org/).

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
