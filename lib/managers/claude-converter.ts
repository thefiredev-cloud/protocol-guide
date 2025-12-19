/**
 * OpenAI to Claude Format Converter
 */

import type {
  ChatMessage,
  ChatPayload,
  ClaudeContentBlock,
  ClaudeMessage,
  ClaudePayload,
  ClaudeTool,
} from "./claude-types";

export class ClaudeConverter {
  public static convertPayload(payload: ChatPayload): ClaudePayload {
    const { systemMessage, nonSystemMessages } = this.extractSystemMessage(payload.messages);
    const claudeMessages = this.convertMessages(nonSystemMessages);
    const alternatingMessages = this.ensureAlternatingMessages(claudeMessages);
    const claudeTools = this.convertTools(payload.tools);
    const claudeToolChoice = this.convertToolChoice(payload.tool_choice);

    // Model must be set from environment config - no hardcoded override
    if (!payload.model) {
      throw new Error("ClaudeConverter: model must be specified in payload (from environment config)");
    }

    return {
      model: payload.model,
      messages: alternatingMessages,
      system: systemMessage,
      max_tokens: 4096,
      temperature: payload.temperature,
      tools: claudeTools,
      tool_choice: claudeToolChoice,
    };
  }

  private static extractSystemMessage(messages: ChatMessage[]): {
    systemMessage: string | undefined;
    nonSystemMessages: ChatMessage[];
  } {
    let systemMessage: string | undefined;
    const nonSystemMessages: ChatMessage[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemMessage = systemMessage ? `${systemMessage}\n\n${msg.content}` : msg.content || undefined;
      } else {
        nonSystemMessages.push(msg);
      }
    }

    return { systemMessage, nonSystemMessages };
  }

  private static convertMessages(messages: ChatMessage[]): ClaudeMessage[] {
    const claudeMessages: ClaudeMessage[] = [];

    for (const msg of messages) {
      if (msg.role === "tool") {
        this.addToolResultMessage(msg, claudeMessages);
      } else if (msg.role === "assistant") {
        this.addAssistantMessage(msg, claudeMessages);
      } else if (msg.role === "user") {
        claudeMessages.push({ role: "user", content: msg.content || "" });
      }
    }

    return claudeMessages;
  }

  private static addToolResultMessage(msg: ChatMessage, claudeMessages: ClaudeMessage[]): void {
    if (claudeMessages.length > 0 && claudeMessages[claudeMessages.length - 1].role === "assistant") {
      const toolResultBlock: ClaudeContentBlock = {
        type: "tool_result",
        tool_use_id: msg.tool_call_id || "unknown",
        content: msg.content || "",
      };

      if (
        claudeMessages.length > 1 &&
        claudeMessages[claudeMessages.length - 1].role === "user" &&
        Array.isArray(claudeMessages[claudeMessages.length - 1].content)
      ) {
        const lastContent = claudeMessages[claudeMessages.length - 1].content as ClaudeContentBlock[];
        lastContent.push(toolResultBlock);
      } else {
        claudeMessages.push({ role: "user", content: [toolResultBlock] });
      }
    }
  }

  private static addAssistantMessage(msg: ChatMessage, claudeMessages: ClaudeMessage[]): void {
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      const toolUseBlocks: ClaudeContentBlock[] = msg.tool_calls.map((call) => ({
        type: "tool_use",
        id: call.id,
        name: call.function.name,
        input: JSON.parse(call.function.arguments) as unknown,
      }));

      claudeMessages.push({ role: "assistant", content: toolUseBlocks });
    } else {
      claudeMessages.push({ role: "assistant", content: msg.content || "" });
    }
  }

  private static convertTools(
    tools?: Array<{ type: "function"; function: { name: string; description: string; parameters: unknown } }>,
  ): ClaudeTool[] | undefined {
    if (!tools || tools.length === 0) return undefined;

    return tools.map((tool) => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: tool.function.parameters as {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
      },
    }));
  }

  private static convertToolChoice(
    toolChoice?: "auto" | "none" | { type: "function"; function: { name: string } },
  ): { type: "auto" | "any" | "tool"; name?: string } | undefined {
    if (!toolChoice) return undefined;

    if (toolChoice === "auto") {
      return { type: "auto" };
    } else if (toolChoice === "none") {
      return undefined;
    } else if (typeof toolChoice === "object" && toolChoice.function) {
      return { type: "tool", name: toolChoice.function.name };
    }

    return undefined;
  }

  private static ensureAlternatingMessages(messages: ClaudeMessage[]): ClaudeMessage[] {
    if (messages.length === 0) {
      return messages;
    }

    const result: ClaudeMessage[] = [];
    let lastRole: "user" | "assistant" | null = null;

    for (const msg of messages) {
      if (lastRole === msg.role && result.length > 0) {
        this.mergeMessageContent(result[result.length - 1], msg);
      } else {
        result.push({ ...msg });
        lastRole = msg.role;
      }
    }

    // Ensure conversation starts with user message
    if (result.length > 0 && result[0].role === "assistant") {
      result.unshift({
        role: "user",
        content: "Hello",
      });
    }

    return result;
  }

  private static mergeMessageContent(lastMsg: ClaudeMessage, newMsg: ClaudeMessage): void {
    if (typeof lastMsg.content === "string" && typeof newMsg.content === "string") {
      lastMsg.content = `${lastMsg.content}\n\n${newMsg.content}`;
    } else if (Array.isArray(lastMsg.content) && Array.isArray(newMsg.content)) {
      lastMsg.content = [...lastMsg.content, ...newMsg.content];
    } else if (typeof lastMsg.content === "string" && Array.isArray(newMsg.content)) {
      lastMsg.content = [{ type: "text", text: lastMsg.content }, ...newMsg.content];
    } else if (Array.isArray(lastMsg.content) && typeof newMsg.content === "string") {
      lastMsg.content = [...lastMsg.content, { type: "text", text: newMsg.content }];
    }
  }
}
