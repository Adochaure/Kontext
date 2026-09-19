import { NextRequest, NextResponse } from "next/server";
import { importConversation, generateAIContext } from "@/lib/conversation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;
    const apiKey = body?.apiKey;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'url' in request body." },
        { status: 400 }
      );
    }

    // 1. Import and normalize the conversation turns
    const conversation = await importConversation(url.trim());

    // 2. Synthesize 100% valuable adaptive AI context
    const context = await generateAIContext(conversation, apiKey);
    conversation.context = context;

    return NextResponse.json(
      {
        success: true,
        conversation,
        context,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred while importing the conversation.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
