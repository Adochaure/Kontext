import { NextResponse } from "next/server";
import type { NormalizedConversation } from "@/lib/conversation/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const key = process.env.XAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Grok is not configured. Add XAI_API_KEY to .env.local and restart the dev server." }, { status: 503 });
  try {
    const { conversation } = await request.json() as { conversation?: NormalizedConversation };
    if (!conversation?.messages?.length) return NextResponse.json({ error: "No imported messages were supplied." }, { status: 400 });
    const transcript = conversation.messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
    const prompt = `Create a high-quality portable context for another AI from this conversation. Return ONLY valid JSON with keys: summary (string), userIntent (string), keyContext (string[]), decisions (string[]), requirements (string[]), activeTasks (string[]), technicalContext (string[]), markdown (string). The markdown must be polished, structured with headings and bullets, and directly useful as a continuation brief. Do not invent facts.\n\nCONVERSATION:\n${transcript}`;
    const response = await fetch("https://api.x.ai/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "grok-4.6", temperature: 0.2, messages: [{ role: "system", content: "You are a precise conversation-context editor." }, { role: "user", content: prompt }] }) });
    if (!response.ok) return NextResponse.json({ error: `Grok request failed (${response.status}). Check XAI_API_KEY and xAI billing.` }, { status: 502 });
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Grok returned no content.");
    const cleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    return NextResponse.json({ context: JSON.parse(cleaned) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? `Context generation failed: ${error.message}` : "Context generation failed." }, { status: 500 });
  }
}
