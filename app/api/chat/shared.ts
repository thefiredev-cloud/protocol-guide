import { NextResponse } from "next/server";
import { z } from "zod";

import { createLogger } from "@/lib/log";
import { knowledgeBaseInitializer } from "@/lib/managers/knowledge-base-initializer";

export const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .min(1, "Must include at least one message"),
  mode: z.enum(["chat", "narrative"]).optional(),
});

export type PreparedRequest = { payload: z.infer<typeof requestSchema> } | { error: NextResponse };

export async function prepareChatRequest(input: unknown): Promise<PreparedRequest> {
  const logger = createLogger("api.chat.prepare");
  try {
    const status = await knowledgeBaseInitializer.warm();
    logger.debug("Knowledge base ready", status);
  } catch (error: unknown) {
    // In test, allow downstream to continue to exercise flows without hard 503
    if (process.env.NODE_ENV !== "test") {
      const message = error instanceof Error ? error.message : "Knowledge base unavailable";
      return { error: NextResponse.json({ error: { code: "KB_UNAVAILABLE", message } }, { status: 503 }) };
    }
  }

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return validationErrorResponse(parsed.error.issues.map((i) => i.message));

  return { payload: parsed.data };
}

function validationErrorResponse(messages: string[]): { error: NextResponse } {
  return {
    error: NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: messages.join("; ") } },
      { status: 400 },
    ),
  };
}

