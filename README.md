# Avalogica Emergent Consumer Needs MCP

**Version:** 0.2.0  
**License:** MIT

The Avalogica Emergent Consumer Needs MCP server powers Avalogica’s Emergent Consumer Needs agent. It analyzes emerging consumer signals, synthesizes market trends, and helps entrepreneurs and business owners brainstorm novel product ideas based on their capabilities and current market trajectories.

---

## Features

- **Emergent consumer needs analysis** via dedicated MCP tools.
- **Product‑idea brainstorming** tailored to user capabilities.
- **Signal aggregation** from emerging‑trend data sources (details coming as tools are implemented).
- Dual transports (STDIO and HTTP) with a `/health` route for readiness checks.
- TypeScript‑first build pipeline with strict type checking.

---

## Prerequisites

- Node.js 18 or later  
- An OpenAI API key (if using tools that call the OpenAI Responses API).

---

## Installation

```bash
git clone https://github.com/mdwillman/avalogica-consumer-needs-mcp.git
cd avalogica-consumer-needs-mcp
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in any required values.

```bash
cp .env.example .env
```

```dotenv
OPENAI_API_KEY=sk-...
# Additional consumer‑needs data source keys will be added as tools are implemented.
# PORT=3002
```

---

## Build & Run

```bash
npm run build
npm run start            # starts HTTP transport on port 8080 by default
npm run dev:stdio        # run via STDIO (useful with the MCP Inspector)
npm run dev:shttp        # HTTP transport with live TypeScript reloading
```

The HTTP server exposes:

- `GET /health` → returns a JSON payload confirming readiness.
- `POST /mcp` / Server-Sent Events under `/sse` for MCP clients.

---

## Tools

Tools for emergent consumer‑needs analysis and product‑idea brainstorming will be added here as they are implemented. Initial placeholders may include:

- `analyze_emergent_needs`
- `brainstorm_product_ideas`

Full schemas and examples will be documented once finalized.

---

## Development Notes

- The codebase remains ESM (`"type": "module"`).
- `npm run build` compiles TypeScript to `dist/` and adjusts the CLI executable bit.
- STDIO transport can be tested with the MCP Inspector: `npm run build && npm run inspector`.

---

## License

MIT © Marshall D. Willman
