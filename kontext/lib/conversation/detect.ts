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

  // Gemini detection
  if (
    hostname === "gemini.google.com" ||
    hostname === "g.co" ||
    hostname === "share.gemini.google" ||
    hostname.endsWith(".gemini.google.com")
  ) {
    // Check if g.co/gemini/share/<id>
    if (hostname === "g.co") {
      const match = pathname.match(/\/gemini\/share\/([a-zA-Z0-9_-]+)/);
      if (!match) {
        throw new Error("Invalid Gemini short link. Format should be: https://g.co/gemini/share/<id>");
      }
      return {
        provider: "gemini",
        shareId: match[1],
        originalUrl: trimmed,
        normalizedUrl: trimmed,
      };
    }

    // Check if share.gemini.google/<id>
    if (hostname === "share.gemini.google") {
      const match = pathname.match(/^\/([a-zA-Z0-9_-]+)/);
      if (!match) {
        throw new Error("Invalid Gemini short link. Format should be: https://share.gemini.google/<id>");
      }
      return {
        provider: "gemini",
        shareId: match[1],
        originalUrl: trimmed,
        normalizedUrl: trimmed,
      };
    }

    // gemini.google.com/share/<id>
    const match = pathname.match(/\/share\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      throw new Error("Invalid Gemini share link. Format should be: https://gemini.google.com/share/<id>");
    }
    const shareId = match[1];
    const skid = parsedUrl.searchParams.get("skid") || undefined;
    return {
      provider: "gemini",
      shareId,
      originalUrl: trimmed,
      normalizedUrl: `https://gemini.google.com/share/${shareId}`,
      extraParams: skid ? { skid } : undefined,
    };
  }

  throw new Error(
    `Unsupported provider from URL: ${parsedUrl.hostname}. Supported platforms are ChatGPT (chatgpt.com), Claude (claude.ai), and Gemini (gemini.google.com).`
  );
}

