// src/tools/searchEmergentSignals.ts
import { ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { ExaClient } from "../exaClient.js";
const exaClient = new ExaClient();
export const searchEmergentSignalsTool = {
    definition: {
        name: "search_emergent_signals",
        description: "Search the wider web for emerging needs, weak signals, complaints, and opportunities related to a topic. Use this for broad discovery of real-world examples and pain points.",
        inputSchema: {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Natural language description of the need, problem, or topic to search for. Phrase it like a researcher looking for real-world examples.",
                },
                numResults: {
                    type: "number",
                    minimum: 1,
                    maximum: 20,
                    description: "How many results to retrieve (1–20). Defaults to 8 if omitted.",
                },
            },
            required: ["query"],
        },
    },
    handler: async (args) => {
        if (!args ||
            typeof args !== "object" ||
            typeof args.query !== "string" ||
            !args.query.trim()) {
            throw new McpError(ErrorCode.InvalidParams, "Invalid or missing arguments for search_emergent_signals. Expected { query: string, numResults?: number }.");
        }
        let numResults = 8;
        if (args.numResults !== undefined) {
            if (typeof args.numResults !== "number" || Number.isNaN(args.numResults)) {
                throw new McpError(ErrorCode.InvalidParams, "numResults must be a number between 1 and 20 if provided.");
            }
            numResults = Math.min(20, Math.max(1, Math.floor(args.numResults)));
        }
        try {
            const trimmedQuery = args.query.trim();
            console.error(`[AI Consumer Needs MCP] 🔍 search_emergent_signals query="${trimmedQuery}" numResults=${numResults}`);
            // According to Exa's TypeScript SDK docs, search/searchAndContents
            // accept { query, numResults, text, ... } as fields.
            const exaRaw = await exaClient.post("/search", {
                query: trimmedQuery,
                numResults,
                text: true, // request full text content where available
            });
            const results = Array.isArray(exaRaw.results)
                ? exaRaw.results
                : [];
            const result = {
                endpoint: "search",
                query: trimmedQuery,
                results,
            };
            // Return as JSON text so the agent can parse / filter / cluster.
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            console.error("[AI Consumer Needs MCP] ❌ search_emergent_signals handler error:", error);
            const message = error instanceof Error
                ? error.message
                : "Unexpected error calling Exa search API.";
            throw new McpError(ErrorCode.InternalError, message);
        }
    },
};
