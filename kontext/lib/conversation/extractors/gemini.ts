import { ConversationMessage, NormalizedConversation } from "../types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export async function extractGemini(
  shareId: string,
  originalUrl: string,
  extraParams?: Record<string, string>
): Promise<NormalizedConversation> {
  // Step 1: Follow redirects to canonical URL and extract skid if present
  let targetUrl = originalUrl;
  let finalShareId = shareId;
  let skid = extraParams?.skid;

  try {
    const redirectRes = await fetch(originalUrl, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT },
      redirect: "manual",
    });

    if (redirectRes.status >= 300 && redirectRes.status < 400) {
      const loc = redirectRes.headers.get("location");
      if (loc) {
        targetUrl = loc.startsWith("http") ? loc : new URL(loc, originalUrl).toString();
        const parsed = new URL(targetUrl);
        const match = parsed.pathname.match(/\/share\/([a-zA-Z0-9_-]+)/);
        if (match) finalShareId = match[1];
        if (parsed.searchParams.has("skid")) skid = parsed.searchParams.get("skid")!;
      }
    }
  } catch {
    // Proceed with targetUrl
  }

  // Step 2: Fetch the page to obtain cookies, tokens, and check for SSR data
  let pageHtml = "";
  let cookiesHeader = "";
  let fdr = "";
  try {
    const pageRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const setCookies = pageRes.headers.getSetCookie ? pageRes.headers.getSetCookie() : [];
    cookiesHeader = setCookies.map((c) => c.split(";")[0]).join("; ");
    pageHtml = await pageRes.text();

    const fdrMatch = pageHtml.match(/"FdrFJe":"([^"]+)"/);
    if (fdrMatch) fdr = fdrMatch[1];
  } catch {
    // Continue to RPC / fallback
  }

  // Check for HTML DOM custom elements: <user-query> and <response-container>
  if (pageHtml) {
    const domMessages = extractFromDom(pageHtml);
    if (domMessages.length > 0) {
      const pageTitle = extractTitleFromHtml(pageHtml);
      return {
        title: pageTitle,
        source: "gemini",
        url: targetUrl,
        messages: domMessages,
      };
    }
  }

  // Step 3: Try Google batchexecute RPC (ujx1Bf)
  try {
    const rpcPayload = skid
      ? [finalShareId, skid]
      : [finalShareId];

    const payload = [[["ujx1Bf", JSON.stringify(rpcPayload), null, "generic"]]];
    const body = new URLSearchParams({
      "f.req": JSON.stringify(payload),
      ...(fdr ? { "f.sid": fdr } : {}),
    });

    const rpcUrl = "https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=ujx1Bf&bl=boq-bard-web.BardChatUi&rt=c";
    const rpcRes = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": USER_AGENT,
        ...(cookiesHeader ? { Cookie: cookiesHeader } : {}),
        Referer: targetUrl,
      },
      body: body.toString(),
    });

    if (rpcRes.ok) {
      const rpcText = await rpcRes.text();
      const parsed = parseBatchExecuteBody(rpcText);
      if (parsed) {
        const messages = extractMessagesFromRpc(parsed);
        if (messages.length > 0) {
          const pageTitle = extractTitleFromHtml(pageHtml);
          return {
            title: pageTitle,
            source: "gemini",
            url: targetUrl,
            messages,
          };
        }
      }
    }
  } catch {
    // Proceed to final fallback
  }

  throw new Error(
    "Could not extract Gemini conversation. The conversation link may be private, expired, or unavailable."
  );
}

function extractTitleFromHtml(html: string): string {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (!match) return "Gemini Conversation";
  const title = match[1]
    .replace(/^[\u200E\s]*Gemini\s*[-–—]\s*/i, "")
    .replace(/\s*\|\s*Google AI$/i, "")
    .trim();
  return title && title !== "direct access to Google AI" ? title : "Gemini Conversation";
}

function extractFromDom(html: string): ConversationMessage[] {
  const messages: ConversationMessage[] = [];
  const regex = /<(user-query|response-container)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const role: "user" | "assistant" = tag === "user-query" ? "user" : "assistant";
    const cleanText = match[2]
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (cleanText) {
      messages.push({ role, content: cleanText });
    }
  }

  return messages;
}

function parseBatchExecuteBody(body: string): unknown {
  for (const line of body.split("\n")) {
    if (!line.startsWith("[")) continue;
    try {
      const chunk = JSON.parse(line);
      if (!Array.isArray(chunk)) continue;

      for (const envelope of chunk) {
        if (!Array.isArray(envelope)) continue;
        if (envelope[0] !== "wrb.fr" || envelope[1] !== "ujx1Bf") continue;
        const payload = envelope[2];
        if (typeof payload === "string") {
          return JSON.parse(payload);
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessagesFromRpc(data: any): ConversationMessage[] {
  const messages: ConversationMessage[] = [];
  try {
    // Structure: data[0][1] is an array of turns
    const turns = data?.[0]?.[1];
    if (Array.isArray(turns)) {
      for (const turn of turns) {
        // Prompt turn[2][0]
        const prompt = turn?.[2]?.[0]?.[0];
        if (typeof prompt === "string" && prompt.trim()) {
          messages.push({ role: "user", content: prompt.trim() });
        }

        // Response turn[3][0][0][1][0]
        const response = turn?.[3]?.[0]?.[0]?.[1]?.[0];
        if (typeof response === "string" && response.trim()) {
          const cleaned = response
            .replace(/^[ \t]*<FollowUp\b[^>]*\/>[ \t]*$\n?/gm, "")
            .replace(/^([ \t]*`{3,}[^\s`?]+)\?\S*$/gm, "$1")
            .trim();

          messages.push({ role: "assistant", content: cleaned });
        }
      }
    }
  } catch {
    // Return whatever was parsed
  }
  return messages;
}

