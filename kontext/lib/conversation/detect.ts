import { DetectResult } from "./types";

export function detectProvider(rawUrl: string): DetectResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Please enter a valid conversation share URL.");
  }

  const trimmed = rawUrl.trim();
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error("Invalid URL format. Please provide a valid URL.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  // ChatGPT detection
  if (
    hostname === "chatgpt.com" ||
    hostname === "chat.openai.com" ||
    hostname.endsWith(".chatgpt.com")
  ) {
    const match = pathname.match(/\/share\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      throw new Error("Invalid ChatGPT share link. Format should be: https://chatgpt.com/share/<id>");
    }
    const shareId = match[1];
    return {
      provider: "chatgpt",
      shareId,
      originalUrl: trimmed,
      normalizedUrl: `https://chatgpt.com/share/${shareId}`,
    };
  }

  // Claude detection
  if (hostname === "claude.ai" || hostname.endsWith(".claude.ai")) {
    const match = pathname.match(/\/share\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      throw new Error("Invalid Claude share link. Format should be: https://claude.ai/share/<id>");
    }
    const shareId = match[1];
    return {
      provider: "claude",
      shareId,
      originalUrl: trimmed,
      normalizedUrl: `https://claude.ai/share/${shareId}`,
    };
  }

  throw new Error(
    `Unsupported provider from URL: ${parsedUrl.hostname}. Supported platforms are ChatGPT (chatgpt.com) and Claude (claude.ai).`
  );
}
