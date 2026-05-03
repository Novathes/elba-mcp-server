#!/usr/bin/env node
import { startServer } from './server.js';

startServer().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Failed to start Elba MCP server');
  process.exit(1);
});
