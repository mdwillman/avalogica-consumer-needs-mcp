// src/tools/searchEmergentSignals.ts

import {
  CallToolResult,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ExaClient } from "../exaClient.js";
import {
  ExaSearchResponse,
  ExaSearchResult,
  SearchEmergentSignalsArgs,
} from "../types.js";

const exaClient = new ExaClient();

export const searchEmergentSignalsTool = {
  definition: {
    name: "search_emergent_signals",
    description:
      "Search the wider web for emerging needs, weak signals, complaints, and opportunities related to a topic. Use this for broad discovery of real-world examples and pain points.",
    inputSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Natural language description of the need, problem, or topic to search for. Phrase it like a researcher looking for real-world examples.",
        },
        numResults: {
          type: "number",
          minimum: 1,
          maximum: 10,
          description:
            "How many results to retrieve (1–10). Defaults to 5 if omitted.",
        },
      },
      required: ["query"],
    },
  },

  handler: async (args: SearchEmergentSignalsArgs): Promise<CallToolResult> => {
    // --- Input validation ---
    if (
      !args ||
      typeof args !== "object" ||
      typeof args.query !== "string" ||
      !args.query.trim()
    ) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid or missing arguments for search_emergent_signals. Expected { query: string, numResults?: number }."
      );
    }

    // --- Default 5, hard cap 10 ---
    let numResults = 5;
    if (args.numResults !== undefined) {
      if (typeof args.numResults !== "number" || Number.isNaN(args.numResults)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "numResults must be a number between 1 and 10 if provided."
        );
      }
      numResults = Math.min(10, Math.max(1, Math.floor(args.numResults)));
    }

    try {
      const trimmedQuery = args.query.trim();

      console.error(
        `[AI Consumer Needs MCP] 🔍 search_emergent_signals query="${trimmedQuery}" numResults=${numResults}`
      );

      // --- Exa Search with compact contents shape ---
      const exaRaw = await exaClient.post("/search", {
        query: trimmedQuery,
        numResults,
        contents: {
          summary: { query: trimmedQuery },
          text: { maxCharacters: 800 },
        },
      });

      const rawResults = Array.isArray(exaRaw.results)
        ? (exaRaw.results as ExaSearchResult[])
        : [];

      // --- Compact + trimmed results ---
      const results: ExaSearchResult[] = rawResults.map((r) => {
        const anyR = r as any;
        const rawText = anyR.text ?? r.text ?? null;
        const summary = anyR.summary ?? r.summary ?? null;

        return {
          ...r,
          summary,
          textSnippet: rawText ? String(rawText).slice(0, 800) : null,
        };
      });

      const result: ExaSearchResponse = {
        endpoint: "search",
        query: trimmedQuery,
        results,
      };

      // --- Defensive payload trimming (cap ~20k chars) ---
      const MAX_CHARS = 20000;
      let payload = JSON.stringify(result);

      if (payload.length > MAX_CHARS) {
        for (const r of result.results) {
          if (r.textSnippet && r.textSnippet.length > 400) {
            r.textSnippet = r.textSnippet.slice(0, 400) + "…";
          }
        }
        payload = JSON.stringify(result);
      }

      return {
        content: [
          {
            type: "text",
            text: payload,
          },
        ],
      };
    } catch (error) {
      console.error(
        "[AI Consumer Needs MCP] ❌ search_emergent_signals handler error:",
        error
      );
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error calling Exa search API.";
      throw new McpError(ErrorCode.InternalError, message);
    }
  },
};