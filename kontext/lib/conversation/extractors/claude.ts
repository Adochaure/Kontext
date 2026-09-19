import { ConversationMessage, NormalizedConversation } from "../types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export async function extractClaude(
  shareId: string,
  originalUrl: string
): Promise<NormalizedConversation> {
  const apiUrl = `https://claude.ai/api/chat_snapshots/${shareId}`;

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
      const title = (data.snapshot_name || "Claude Conversation").trim();
      const messages: ConversationMessage[] = [];

      if (Array.isArray(data.chat_messages)) {
        for (const msg of data.chat_messages) {
          const sender = msg.sender;
          let role: "user" | "assistant";
          if (sender === "human" || sender === "user") {
            role = "user";
          } else if (sender === "assistant") {
            role = "assistant";
          } else {
            continue;
          }

          let textContent = "";
          if (typeof msg.text === "string" && msg.text.trim()) {
            textContent = msg.text.trim();
          } else if (Array.isArray(msg.content)) {
            textContent = msg.content
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((block: any) => (typeof block?.text === "string" ? block.text : ""))
              .filter(Boolean)
              .join("\n\n")
              .trim();
          }

          if (textContent) {
            messages.push({
              role,
              content: textContent,
            });
          }
        }
      }

      if (messages.length > 0) {
        return {
          title,
          source: "claude",
          url: `https://claude.ai/share/${shareId}`,
          messages,
        };
      }
    }
  } catch {
    // Attempt fallback
  }

  // Fallback: Fetch share HTML
  return await extractClaudeFromHtml(shareId, originalUrl);
}

async function extractClaudeFromHtml(
  shareId: string,
  originalUrl: string
): Promise<NormalizedConversation> {
  const shareUrl = `https://claude.ai/share/${shareId}`;
  const res = await fetch(shareUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Claude share page (HTTP ${res.status}). The link may be private or expired.`
    );
  }

  const html = await res.text();
  const rawTitle = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || "Claude Conversation";
  const title = rawTitle.replace(/\s*\|\s*Claude$/i, "").trim();

  // Try extracting messages from HTML
  const messages: ConversationMessage[] = [];
  const userRegex = /<div[^>]*data-testid=["']user-message["'][^>]*>([\s\S]*?)<\/div>/gi;
  let userMatch: RegExpExecArray | null;
  while ((userMatch = userRegex.exec(html)) !== null) {
    const text = userMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text) {
      messages.push({ role: "user", content: text });
    }
  }

  if (messages.length === 0) {
    throw new Error(
      "Could not extract messages from Claude share link. Ensure the link is public and accessible."
    );
  }

  return {
    title: title || "Claude Conversation",
    source: "claude",
    url: originalUrl || `https://claude.ai/share/${shareId}`,
    messages,
  };
}
