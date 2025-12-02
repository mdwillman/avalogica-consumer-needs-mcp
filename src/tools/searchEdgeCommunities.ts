// src/tools/searchEdgeCommunities.ts

import {
  CallToolResult,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ExaClient } from "../exaClient.js";
import {
  ExaSearchResponse,
  ExaSearchResult,
  SearchEdgeCommunitiesArgs,
} from "../types.js";

const exaClient = new ExaClient();

export const searchEdgeCommunitiesTool = {
  definition: {
    name: "search_edge_communities",
    description:
      "Search early-adopter communities (e.g., Reddit, Hacker News, niche forums, GitHub) for complaints, hacked workflows, and 'somebody please build this' posts. Use this when you want raw, ground-level signals about unmet needs.",
    inputSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Description of the need, frustration, or workflow to investigate among early adopters (e.g., 'small business owners frustrated with AI agents for bookkeeping').",
        },
        numResults: {
          type: "number",
          minimum: 1,
          maximum: 20,
          description:
            "How many community posts/pages to retrieve (1–20). Defaults to 10 if omitted.",
        },
      },
      required: ["query"],
    },
  },

  handler: async (args: SearchEdgeCommunitiesArgs): Promise<CallToolResult> => {
    if (
      !args ||
      typeof args !== "object" ||
      typeof args.query !== "string" ||
      !args.query.trim()
    ) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid or missing arguments for search_edge_communities. Expected { query: string, numResults?: number }."
      );
    }

    let numResults = 10;
    if (args.numResults !== undefined) {
      if (typeof args.numResults !== "number" || Number.isNaN(args.numResults)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "numResults must be a number between 1 and 20 if provided."
        );
      }
      numResults = Math.min(20, Math.max(1, Math.floor(args.numResults)));
    }

    try {
      const trimmedQuery = args.query.trim();
      console.error(
        `[AI Consumer Needs MCP] 🔍 search_edge_communities query="${trimmedQuery}" numResults=${numResults}`
      );

      // We bias toward edge / early-adopter communities.
      const exaRaw = await exaClient.post("/search", {
        query: trimmedQuery,
        // support both common shapes; Exa will ignore extras it doesn't use
        numResults,
        num_results: numResults,
        // ask for text content where supported
        text: true,
        contents: { text: true },
        // domain filters in both likely shapes
        domainFilters: {
          include: [
            "reddit.com",
            "news.ycombinator.com",
            "github.com",
            "lobste.rs",
          ],
        },
        includeDomains: [
          "reddit.com",
          "news.ycombinator.com",
          "github.com",
          "lobste.rs",
        ],
      });

      const results: ExaSearchResult[] = Array.isArray(exaRaw.results)
        ? (exaRaw.results as ExaSearchResult[])
        : [];

      const result: ExaSearchResponse = {
        endpoint: "search_edge_communities",
        query: trimmedQuery,
        results,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(
        "[AI Consumer Needs MCP] ❌ search_edge_communities handler error:",
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