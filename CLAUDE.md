# CLAUDE.md

This file provides context for AI assistants working on this codebase.

## Project Overview

This is an open-source MCP (Model Context Protocol) server for Elba, a voice AI agent platform. It exposes Elba's agent lifecycle as MCP tools callable from any MCP-compatible client (Claude Code, Cursor, VS Code, etc.).

## Current Status

Phase 1 tools are implemented and wired into the server:
- `list_agents` — lists all agents in the organization
- `list_voices` — lists available voices
- `upsert_agent` — creates or updates a voice AI agent

Auth validation (`src/auth.ts`) checks token format (must start with `elba_`). Full token validation happens server-side via the Elba API.

## Architecture

- **Thin client pattern**: The MCP server is a thin wrapper around Elba's backend API. All business logic lives in the Elba platform — this server just translates MCP tool calls into API requests.
- **Authentication**: Uses integration tokens (`ELBA_INTEGRATION_TOKEN` env var) validated against the Elba backend on every tool call.
- **Transport**: stdio (local) by default. The server is started by the MCP client process.

## Key Files

- `src/index.ts` — CLI entry point (shebang, starts server)
- `src/server.ts` — MCP server initialization, tool registration
- `src/auth.ts` — Token validation against Elba backend
- `src/tools/` — One file per MCP tool
- `__tests__/` — Mirrors src/ structure, uses vitest

## Commands

- `npm run build` — Compile TypeScript to dist/
- `npm run dev` — Run server in development mode (tsx)
- `npm test` — Run tests (vitest)
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript type checking
- `npx changeset` — Create a changeset for version bumping

## Conventions

- ESM only (`"type": "module"` in package.json)
- Imports use `.js` extensions (NodeNext module resolution)
- One tool per file in `src/tools/`
- Tests mirror source structure in `__tests__/`
- All tools validate auth before executing
