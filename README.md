<p align="center">
  <h1 align="center">Elba MCP Server</h1>
  <p align="center">
    Manage voice AI agents from Claude Code, Cursor, VS Code, or any MCP-compatible assistant.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kolsetu-opensource/elba-mcp-server"><img src="https://img.shields.io/npm/v/@kolsetu-opensource/elba-mcp-server?color=blue&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@kolsetu-opensource/elba-mcp-server"><img src="https://img.shields.io/npm/dm/@kolsetu-opensource/elba-mcp-server?color=blue" alt="npm downloads"></a>
  <a href="https://github.com/Novathes/elba-mcp-server/actions/workflows/ci.yml"><img src="https://github.com/Novathes/elba-mcp-server/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/Novathes/elba-mcp-server/actions/workflows/codeql.yml"><img src="https://github.com/Novathes/elba-mcp-server/actions/workflows/codeql.yml/badge.svg" alt="CodeQL"></a>
  <a href="https://github.com/Novathes/elba-mcp-server/actions/workflows/osv-scanner.yml"><img src="https://github.com/Novathes/elba-mcp-server/actions/workflows/osv-scanner.yml/badge.svg" alt="OSV Scanner"></a>
  <a href="https://github.com/Novathes/elba-mcp-server/actions/workflows/osv-scanner-pr.yml"><img src="https://github.com/Novathes/elba-mcp-server/actions/workflows/osv-scanner-pr.yml/badge.svg" alt="OSV Scanner PR"></a>
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/Novathes/elba-mcp-server"><img src="https://api.securityscorecards.dev/projects/github.com/Novathes/elba-mcp-server/badge" alt="OpenSSF Scorecard"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://github.com/Novathes/elba-mcp-server/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a href="https://img.shields.io/node/v/@kolsetu-opensource/elba-mcp-server"><img src="https://img.shields.io/node/v/@kolsetu-opensource/elba-mcp-server" alt="Node.js version"></a>
</p>

---

> [!NOTE]
> **Early preview** — This project is under active development. See the [roadmap](#roadmap) below for planned tools.

## Why?

Building voice AI agents usually means clicking through a dashboard. With this MCP server, you can do it all from your editor:

- **Create agents** with a prompt — describe what you want, your AI assistant builds it
- **Iterate fast** — change system prompts, swap voices, test — all without leaving your IDE
- **Version control** — agent configs live in your workflow, not trapped in a dashboard
- **Zero context switching** — ask Claude or Cursor to manage your agents directly

[Elba](https://elba.kolsetu.com) is a voice AI agent platform by [Kolsetu](https://kolsetu.com). This MCP server is a thin client that translates MCP tool calls into Elba API requests — all business logic lives in the Elba platform.

## Quick Start

### 1. Get your integration token

Go to [Elba Dashboard](https://elba.kolsetu.com) → **Settings** → **Integrations** → Copy your token.

### 2. Add to your MCP client

<details open>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add elba -- -e ELBA_INTEGRATION_TOKEN=your-token-here npx -y @kolsetu-opensource/elba-mcp-server
```

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "elba": {
      "command": "npx",
      "args": ["-y", "@kolsetu-opensource/elba-mcp-server"],
      "env": {
        "ELBA_INTEGRATION_TOKEN": "your-token-here"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "elba": {
      "command": "npx",
      "args": ["-y", "@kolsetu-opensource/elba-mcp-server"],
      "env": {
        "ELBA_INTEGRATION_TOKEN": "your-token-here"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code</strong></summary>

Add to `.vscode/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "elba": {
        "command": "npx",
        "args": ["-y", "@kolsetu-opensource/elba-mcp-server"],
        "env": {
          "ELBA_INTEGRATION_TOKEN": "your-token-here"
        }
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "elba": {
      "command": "npx",
      "args": ["-y", "@kolsetu-opensource/elba-mcp-server"],
      "env": {
        "ELBA_INTEGRATION_TOKEN": "your-token-here"
      }
    }
  }
}
```

</details>

### 3. Start using it

Once connected, ask your AI assistant things like:

- *"List all my Elba agents"*
- *"Create a new voice agent called 'Support Bot' that handles customer billing questions"*
- *"What voices are available? Switch my agent to use a different voice"*
- *"Update the system prompt for my agent to be more friendly"*

## Available Tools

| Tool | Description |
|------|-------------|
| `list_agents` | List all agents in your organization — returns ID, name, and status |
| `list_voices` | Browse available voices — returns ID, name, description, and provider |
| `upsert_agent` | Create or update a voice AI agent — matches by name or explicit ID |

## Architecture

```
┌─────────────────┐     stdio      ┌──────────────────┐     HTTPS     ┌──────────────┐
│   MCP Client    │◄──────────────►│  Elba MCP Server │◄────────────►│  Elba API    │
│ (Claude, Cursor │                │  (this project)  │              │  (backend)   │
│  VS Code, etc.) │                │  Thin client     │              │              │
└─────────────────┘                └──────────────────┘              └──────────────┘
```

- **Thin client** — no business logic here; the server translates MCP calls into API requests
- **Local execution** — runs as a stdio child process, no network exposure
- **Org-scoped tokens** — each integration token is limited to a single organization

## Roadmap

### Phase 1 — Core Agent Management ✅

| Tool | Description | Status |
|------|-------------|--------|
| `list_agents` | List all agents in your organization | ✅ Done |
| `upsert_agent` | Create or update a voice AI agent | ✅ Done |
| `list_voices` | Browse available voices with descriptions | ✅ Done |

### Phase 2 — Deploy & Test

| Tool | Description | Status |
|------|-------------|--------|
| `deploy_widget` | Deploy agent as embeddable web widget | Planned |
| `trigger_test_call` | Trigger a test call to your agent | Planned |
| `get_call_history` | View recent call history and outcomes | Planned |
| `get_credits` | Check organization credit balance | Planned |

### Phase 3 — IVR & Telephony

| Tool | Description | Status |
|------|-------------|--------|
| Workflow tools | IVR replacement, call routing | Future |
| Phone number management | Twilio BYOC import, number assignment | Future |

## Security

This project takes supply chain security seriously:

| Measure | Status |
|---------|--------|
| [OpenSSF Scorecard](https://securityscorecards.dev/viewer/?uri=github.com/Novathes/elba-mcp-server) | [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/Novathes/elba-mcp-server/badge)](https://securityscorecards.dev/viewer/?uri=github.com/Novathes/elba-mcp-server) |
| [CodeQL Analysis](https://github.com/Novathes/elba-mcp-server/actions/workflows/codeql.yml) | Static analysis on every push & PR |
| [OSV Scanner](https://osv.dev/) | Dependency vulnerability scanning via [Google OSV](https://google.github.io/osv-scanner/) |
| [Dependency Review](https://github.com/Novathes/elba-mcp-server/actions/workflows/dependency-review.yml) | Block PRs introducing known-vulnerable packages |
| [StepSecurity Harden Runner](https://github.com/step-security/harden-runner) | Audit all outbound network calls in CI |
| Pinned Actions | All GitHub Actions pinned to full SHA commits |
| npm Provenance | Published with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) for verifiable builds |
| Signed Commits | DCO sign-off required on all contributions |

### Authentication

1. Log in to [Elba](https://elba.kolsetu.com)
2. Go to **Settings → Integrations**
3. Generate or copy your integration token
4. Set it as `ELBA_INTEGRATION_TOKEN` in your MCP client config

Tokens are scoped to your organization — they can only access agents and data within your org.

### Vulnerability Reporting

**Do NOT open public issues for security vulnerabilities.** See [SECURITY.md](SECURITY.md) for responsible disclosure via GitHub Security Advisories.

## Development

```bash
# Clone the repo
git clone https://github.com/Novathes/elba-mcp-server.git
cd elba-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type-check
npm run typecheck

# Lint
npm run lint

# Start in dev mode
npm run dev
```

Requires **Node.js ≥ 20** (see [.nvmrc](.nvmrc)).

### Project Structure

```
src/
├── index.ts          # CLI entry point
├── server.ts         # MCP server init, tool registration
├── config.ts         # Environment config
├── auth.ts           # Token format validation
├── elba-client.ts    # Elba API client
└── tools/
    ├── list-agents.ts
    ├── list-voices.ts
    └── upsert-agent.ts
__tests__/            # Mirrors src/ structure (vitest)
```

## Troubleshooting

### "ELBA_INTEGRATION_TOKEN environment variable is required"

Make sure you've set the token in your MCP client config. See [Quick Start](#2-add-to-your-mcp-client) for examples.

### "Invalid or expired integration token"

Your token may have been revoked or expired. Generate a new one from [Elba Dashboard](https://elba.kolsetu.com) → Settings → Integrations.

### Server not starting

1. Check you're running **Node.js ≥ 20**: `node --version`
2. Try running directly: `ELBA_INTEGRATION_TOKEN=your-token npx @kolsetu-opensource/elba-mcp-server`
3. Check your MCP client logs for error messages

### Still stuck?

- [Open a discussion](https://github.com/Novathes/elba-mcp-server/discussions) for questions
- [File an issue](https://github.com/Novathes/elba-mcp-server/issues/new?template=bug_report.yml) for bugs

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Quick version:

```bash
# Make your changes, then:
npm run lint && npm run typecheck && npm test
npx changeset    # describe your change
git commit -s     # sign-off required (DCO)
```

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <a href="https://kolsetu.com">Kolsetu GmbH</a> · <a href="https://elba.kolsetu.com">Elba</a>
</p>
