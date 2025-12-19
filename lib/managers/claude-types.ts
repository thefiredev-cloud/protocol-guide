/**
 * Claude API Types and Conversion Utilities
 */

// Claude-specific message types
export type ClaudeContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; tool_use_id: string; content: string };

export type ClaudeMessage = {
  role: "user" | "assistant";
  content: string | ClaudeContentBlock[];
};

export type ClaudeTool = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

export type ClaudePayload = {
  model: string;
  messages: ClaudeMessage[];
  system?: string;
  max_tokens: number;
  temperature?: number;
  tools?: ClaudeTool[];
  tool_choice?: { type: "auto" | "any" | "tool"; name?: string };
};

export type ClaudeResponse = {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<
    | { type: "text"; text: string }
    | { type: "tool_use"; id: string; name: string; input: unknown }
  >;
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "tool_use" | "stop_sequence";
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

// OpenAI-compatible types for interface compatibility
export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
};

export type ChatPayload = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: unknown;
    };
  }>;
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
};

export type ClaudeStreamEvent =
  | { type: "content_block_start"; content_type: "text" | "tool_use" }
  | { type: "content_block_delta"; delta: { type: "text_delta"; text: string } | { type: "input_json_delta"; partial_json: string } }
  | { type: "message_delta"; delta: { stop_reason: string | null } }
  | { type: "message_stop" };
