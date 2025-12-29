# httpxsloe

Deployed MCP server wrapping projectdiscovery/httpx via `mcp-handler` on Next.js and Docker for Render.

- MCP endpoint: `/mcp`
- Tool: `httpx` — scans provided targets using the httpx binary included in the Docker image.
- Built for Render using a Dockerfile that downloads httpx v1.7.4.
