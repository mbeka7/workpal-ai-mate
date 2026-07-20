import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatBody = { messages?: unknown; system?: string };

const DEFAULT_SYSTEM = `You are AI Workplace Mate, a professional workplace productivity assistant.
You help professionals draft emails, plan tasks, summarize meetings, research topics, and brainstorm ideas.
Guidelines:
- Be concise, clear, and structured. Use markdown (headings, lists, bold) for readability.
- When drafting emails, ask for missing key details only if truly needed; otherwise make reasonable assumptions and note them.
- When summarizing, always separate: Executive Summary, Key Points, Action Items (with owners/dates if given), Decisions, Risks, Next Steps.
- Never fabricate statistics, citations, names, or dates. If unsure, say so.
- Refuse or add safeguards for confidential, legal, financial, or medical advice; recommend expert review.
- Keep a professional, helpful tone.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, system } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system: system ? `${DEFAULT_SYSTEM}\n\n${system}` : DEFAULT_SYSTEM,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
      },
    },
  },
});
