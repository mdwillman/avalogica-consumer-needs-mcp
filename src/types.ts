/**
 * Type definitions for Avalogica Consumer Needs MCP
 */

export interface TechUpdateArgs {
  topic: string;
}

export interface TechUpdateCitation {
  label: string;
  url: string;
}

export interface TechUpdateResult {
  content: string;
  citations: TechUpdateCitation[];
  model: string;
  createdAt: string;
  topic: string;
  title: string;
  description: string;
  fingerprint: string;
}