import { detectProvider } from "./detect";
import { extractChatGPT } from "./extractors/chatgpt";
import { extractClaude } from "./extractors/claude";
import { extractGemini } from "./extractors/gemini";
import { NormalizedConversation } from "./types";

export * from "./types";
export * from "./detect";
export * from "./context-generator";

export async function importConversation(url: string): Promise<NormalizedConversation> {
  const detected = detectProvider(url);

  let conversation: NormalizedConversation;
  switch (detected.provider) {
    case "chatgpt":
      conversation = await extractChatGPT(detected.shareId, detected.originalUrl);
      break;
    case "claude":
      conversation = await extractClaude(detected.shareId, detected.originalUrl);
      break;
    case "gemini":
      conversation = await extractGemini(
        detected.shareId,
        detected.originalUrl,
        detected.extraParams
      );
      break;
    default:
      throw new Error(`Unsupported provider: ${detected.provider}`);
  }

  if (!conversation || !Array.isArray(conversation.messages) || conversation.messages.length === 0) {
    throw new Error(
      `No messages could be extracted from this ${detected.provider} link. Please make sure the conversation is public and accessible.`
    );
  }

  return conversation;
}

