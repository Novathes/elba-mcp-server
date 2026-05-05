# Elba MCP Server

> Manage voice AI agents from Claude Code, Cursor, or any MCP-compatible assistant.

[![npm version](https://img.shields.io/npm/v/@novathes/elba-mcp-server?color=blue)](https://www.npmjs.com/package/@novathes/elba-mcp-server)
[![CI](https://github.com/Novathes/elba-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/Novathes/elba-mcp-server/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> [!NOTE]
> **Early preview** — This project is under active development. See the [roadmap](#roadmap) below for planned tools.

[Elba](https://elba.kolsetu.com) is a voice AI agent platform. This MCP server lets you create, manage, and test voice AI agents entirely from your coding environment — no dashboard required.

## Quick Start

### 1. Get your integration token

Go to [Elba Dashboard](https://elba.kolsetu.com) → **Settings** → **Integrations** → Copy your token.

### 2. Add to your MCP client

#### Claude Code

```bash
claude mcp add elba -- -e ELBA_INTEGRATION_TOKEN=your-token-here npx -y @Kolsetu-Opensource/elba-mcp-server
```

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "elba": {
      "command": "npx",
      "args": ["-y", "@Kolsetu-Opensource/elba-mcp-server"],
      "env": {
        "ELBA_INTEGRATION_TOKEN": "your-token-here"
      }
    }
  }
}
```

#### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "elba": {
      "command": "npx",
      "args": ["-y", "@Kolsetu-Opensource/elba-mcp-server"],
      "env": {
        "ELBA_INTEGRATION_TOKEN": "your-token-here"
      }
    }
  }
}
```

#### VS Code

Add to `.vscode/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "elba": {
        "command": "npx",
        "args": ["-y", "@Kolsetu-Opensource/elba-mcp-server"],
        "env": {
          "ELBA_INTEGRATION_TOKEN": "your-token-here"
        }
      }
    }
  }
}
```

## Roadmap

### Phase 1 — Core Agent Management (in progress)

| Tool | Description | Status |
|------|-------------|--------|
| `list_agents` | List all agents in your organization | 🚧 In progress |
| `upsert_agent` | Create or update a voice AI agent | Planned |
| `list_voices` | Browse available voices with descriptions | Planned |

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

## Authentication

The server authenticates using an Elba integration token:

1. Log in to [Elba](https://elba.kolsetu.com)
2. Go to **Settings → Integrations**
3. Generate or copy your integration token
4. Set it as `ELBA_INTEGRATION_TOKEN` in your MCP client config

Tokens are scoped to your organization — they can only access agents and data within your org.

## Security

- **Org-scoped tokens** — each token is limited to a single organization
- **Local execution** — the server runs locally via stdio with no network exposure
- **HTTPS only** — all communication with the Elba backend uses HTTPS
- **Vulnerability reporting** — see [SECURITY.md](SECURITY.md) for responsible disclosure

## Development

```bash
# Clone the repo
git clone https://github.com/Kolsetu-Opensource/elba-mcp-server.git
cd elba-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Start in dev mode (auto-reload)
npm run dev
```

Requires Node.js ≥ 20.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built by [Kolsetu GmbH](https://kolsetu.com) · [Elba](https://elba.kolsetu.com)
