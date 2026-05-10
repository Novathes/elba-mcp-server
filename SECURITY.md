# Security Policy

## Reporting Vulnerabilities

**Please do NOT open public issues for security vulnerabilities.**

Instead, use GitHub Security Advisories to report them privately:

👉 [**Report a vulnerability**](https://github.com/Kolsetu-Opensource/elba-mcp-server/security/advisories/new)

We will acknowledge your report within **48 hours** and work with you to understand the issue and plan a fix. We'll keep you informed of our progress throughout the process.

## Scope

The following types of vulnerabilities are **in scope** for this project:

- Authentication bypass (e.g., tool execution without a valid integration token)
- Token leakage (e.g., `ELBA_INTEGRATION_TOKEN` exposed in logs, error messages, or tool outputs)
- Prompt injection leading to unauthorized actions (e.g., crafted tool inputs that cause unintended API calls)
- Dependency vulnerabilities that affect this package

## MCP-Specific Security Considerations

- **Integration tokens** (`ELBA_INTEGRATION_TOKEN`) are scoped per-organization. A token grants access only to the agents and resources within that organization.
- **Planned:** Tool output sanitization to mitigate prompt injection is planned as tools are implemented.
- **The server runs locally** using stdio transport by default. There is no network exposure in the default configuration — the MCP client starts the server as a local child process.
- **All API calls** to the Elba backend use **HTTPS**. No plaintext HTTP communication is made.

## Out of Scope

Vulnerabilities in the **Elba platform or backend** itself are out of scope for this repository. If you discover a security issue with the Elba platform, please report it directly to:

📧 **security@kolsetu.com**

## Supported Versions

Only the **latest release** of `@kolsetu-opensource/elba-mcp-server` receives security patches. We recommend always running the most recent version.

| Version        | Supported          |
| -------------- | ------------------ |
| Latest release | ✅ Yes             |
| Older versions | ❌ No              |
