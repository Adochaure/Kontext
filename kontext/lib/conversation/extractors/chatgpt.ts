import { ConversationMessage, NormalizedConversation } from "../types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export async function extractChatGPT(
  shareId: string,
  originalUrl: string
): Promise<NormalizedConversation> {
  const apiUrl = `https://chatgpt.com/backend-api/share/${shareId}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const title = (data.title || "ChatGPT Conversation").trim();
      const messages: ConversationMessage[] = [];

      if (Array.isArray(data.linear_conversation)) {
        for (const item of data.linear_conversation) {
          const msg = item.message;
          if (!msg || !msg.author) continue;

          const role = msg.author.role;
          if (role !== "user" && role !== "assistant") continue;

          let textContent = "";
          if (Array.isArray(msg.content?.parts)) {
            textContent = msg.content.parts
              .filter((p: unknown) => typeof p === "string")
              .join("\n")
              .trim();
          } else if (typeof msg.content?.text === "string") {
            textContent = msg.content.text.trim();
          }

          if (textContent) {
            messages.push({
              role,
              content: textContent,
            });
          }
        }
      } else if (data.mapping && typeof data.mapping === "object") {
        // Fallback for tree-based mapping
        const nodes = Object.values(data.mapping)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((n: any) => n.message)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((m: any) => m && (m.author?.role === "user" || m.author?.role === "assistant"))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => (a.create_time || 0) - (b.create_time || 0));

        for (const msg of nodes) {
          let textContent = "";
          if (Array.isArray(msg.content?.parts)) {
            textContent = msg.content.parts
              .filter((p: unknown) => typeof p === "string")
              .join("\n")
              .trim();
          } else if (typeof msg.content?.text === "string") {
            textContent = msg.content.text.trim();
          }

          if (textContent) {
            messages.push({
              role: msg.author.role,
              content: textContent,
            });
          }
        }
      }

      if (messages.length > 0) {
        return {
          title,
          source: "chatgpt",
          url: `https://chatgpt.com/share/${shareId}`,
          messages,
        };
      }
    }
  } catch {
    // Attempt fallback HTML parsing below
  }

  // Fallback: Fetch the share HTML page
  return await extractChatGPTFromHtml(shareId, originalUrl);
}

async function extractChatGPTFromHtml(
  shareId: string,
  originalUrl: string
): Promise<NormalizedConversation> {
  const shareUrl = `https://chatgpt.com/share/${shareId}`;
  const res = await fetch(shareUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch ChatGPT share page (HTTP ${res.status}). The link may be private or expired.`
    );
  }

  const html = await res.text();
  const rawTitle = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || "ChatGPT Conversation";
  const title = rawTitle
    .replace(/^ChatGPT\s*[-–—]\s*/i, "")
    .replace(/\s*\|\s*OpenAI$/i, "")
    .trim();

  // Try extracting messages from HTML structure
  const messages: ConversationMessage[] = [];
  const messageRegex =
    /<(?:div|article)[^>]*data-message-author-role=["'](user|assistant)["'][^>]*>([\s\S]*?)<\/(?:div|article)>/gi;

  let match: RegExpExecArray | null;
  while ((match = messageRegex.exec(html)) !== null) {
    const role = match[1].toLowerCase() as "user" | "assistant";
    const rawContent = match[2]
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (rawContent) {
      messages.push({
        role,
        content: rawContent,
      });
    }
  }

  if (messages.length === 0) {
    throw new Error(
      "Could not extract messages from ChatGPT share link. Ensure the link is public and still accessible."
    );
  }

  return {
    title: title || "ChatGPT Conversation",
    source: "chatgpt",
    url: originalUrl || `https://chatgpt.com/share/${shareId}`,
    messages,
  };
}

