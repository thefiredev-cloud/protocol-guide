import type { ChatMessage } from "@/app/types/chat";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export type ChatPayload = {
  model: string;
  temperature: number;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
};

export class PayloadBuilder {
  constructor(private readonly model: string, private readonly temperature = 0.2) {}

  public build(context: string, intake: string, messages: ChatMessage[]): ChatPayload {
    return {
      model: this.model,
      temperature: this.temperature,
      messages: this.buildMessages(context, intake, messages),
    } as const;
  }

  private buildMessages(context: string, intake: string, messages: ChatMessage[]) {
    return [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "system" as const, content: `INTAKE:\n${intake}` },
      { role: "system" as const, content: `CONTEXT:\n${context}` },
      ...messages,
    ];
  }
}


