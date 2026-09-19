import { DecisionItem, DomainSection, GeneratedContext, NormalizedConversation } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

export async function generateAIContext(
  conversation: NormalizedConversation,
  userApiKey?: string
): Promise<GeneratedContext> {
  const apiKey = userApiKey?.trim() || process.env.GROQ_API_KEY?.trim();

  // If API key is available, call openai/gpt-oss-120b on Groq with fallback
  if (apiKey) {
    try {
      const result = await callGroqModel(conversation, apiKey, PRIMARY_MODEL);
      if (result) return result;
    } catch (primaryErr) {
      console.warn(`Groq primary model (${PRIMARY_MODEL}) failed, trying fallback model:`, primaryErr);
      try {
        const fallbackResult = await callGroqModel(conversation, apiKey, FALLBACK_MODEL);
        if (fallbackResult) return fallbackResult;
      } catch (fallbackErr) {
        console.warn(`Groq fallback model (${FALLBACK_MODEL}) also failed:`, fallbackErr);
      }
    }
  }

  // Adaptive fallback generator when no API key or API call fails
  return generateAdaptiveFallback(conversation);
}

async function callGroqModel(
  conversation: NormalizedConversation,
  apiKey: string,
  modelName: string
): Promise<GeneratedContext | null> {
  // Format up to 80 conversation turns with full depth
  const formattedTranscript = conversation.messages
    .slice(0, 80)
    .map(
      (m, idx) =>
        `[TURN ${idx + 1} - ${m.role === "user" ? "USER" : "ASSISTANT"}]:\n${m.content.slice(0, 6000)}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are the Senior AI Continuation Architect for "Kontext".
Your mission is to transform an imported conversation into an exhaustive, clean, and high-fidelity context document so another AI can continue the work with zero loss of nuance.

CRITICAL FORMATTING & EXTRACTION RULES:
1. STRICTLY NO EMOJIS: Do NOT use emojis anywhere in the output (no emoji icons in titles, headings, bullet points, or body text). Maintain clean, professional, senior-level typography.
2. NO HARDCODED OR GENERIC NEXT STEPS: Do NOT append generic filler steps (e.g. "Resume execution from current state", "Review open questions", "Validate implementations"). The goal is to provide the true context history and active state of what was discussed and created. If and only if the conversation ended with an explicit, unresolved inquiry or specific pending task from the user, record that in "pendingInquiry". Otherwise, leave it empty.
3. CONTEXT & CONVERSATION HISTORY: Synthesize a thorough, detailed multi-paragraph narrative of what was explored across the exchanges, the problems analyzed, the solutions evaluated, and the evolution of the session.
4. DECISIONS LOG: Detail every technical, architectural, narrative, or strategic choice agreed upon, including the topic, the concrete decision, and the underlying rationale.
5. DISCARDED ALTERNATIVES: Explicitly document any proposals, alternative methods, or rejected ideas discussed, with reasons why they were ruled out.
6. SPECIFICATIONS & PARAMETERS: Extract concrete parameters, code patterns, schema definitions, API contracts, character profiles, or domain guidelines established in the conversation.
7. CURRENT STATE & LATEST DELIVERABLES: Accurately specify the exact state of progress reached at the end of the conversation: what is functional, what code was written, and what solutions were finalized.
8. AI CONTINUATION PROMPT: Write a clean, prompt-engineered prompt in markdown that equips any recipient AI to immediately understand all prior context and resume the work seamlessly.

Output MUST be a valid JSON object matching EXACTLY this structure:
{
  "category": "Granular domain category (e.g. 'Full-Stack Distributed Architecture', 'Creative Narrative & Worldbuilding', 'B2B Enterprise Strategy')",
  "objective": "Detailed explanation of the user's primary goal, requirements, and background context.",
  "summary": "Multi-paragraph comprehensive narrative of the conversation history, problems solved, and solutions developed.",
  "decisions": [
    {
      "topic": "Specific subject",
      "decision": "Concrete decision made with full detail",
      "rationale": "Why this was chosen over alternatives"
    }
  ],
  "discardedOptions": [
    "Discarded alternative with reason why it was rejected"
  ],
  "specifications": [
    {
      "title": "Domain Specification Group",
      "items": [
        "Concrete parameter, constraint, schema, or rule 1",
        "Concrete parameter, constraint, schema, or rule 2"
      ]
    }
  ],
  "currentState": "Precise summary of the latest state, functional deliverables, or solutions reached at the close of the conversation.",
  "pendingInquiry": "If the conversation ended with an unresolved question or pending user instruction, state it here. Otherwise leave as empty string.",
  "aiPrompt": "Master AI continuation prompt formatted in clean markdown without emojis, containing full context history, constraints, and current state."
}`;

  const userPrompt = `Conversation Title: "${conversation.title}"
Platform: ${conversation.source}
Total Turns: ${conversation.messages.length}

Complete Transcript:
${formattedTranscript}

Generate the clean, exhaustive continuation context JSON object now.`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 5000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API (${modelName}) returned HTTP ${response.status}: ${errText}`);
  }

  const resJson = await response.json();
  const rawContent = resJson.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  const parsed = JSON.parse(rawContent);

  const category = parsed.category || "General Discussion & Architecture";
  const objective = parsed.objective || `Accomplish the goal set forth in: ${conversation.title}`;
  const summary = parsed.summary || "Conversation context extracted successfully.";
  const decisions: DecisionItem[] = Array.isArray(parsed.decisions)
    ? parsed.decisions.map((d: { topic?: string; decision?: string; rationale?: string }) => ({
        topic: d.topic || "Core Decision",
        decision: d.decision || "",
        rationale: d.rationale || undefined,
      }))
    : [];
  const discardedOptions: string[] = Array.isArray(parsed.discardedOptions)
    ? parsed.discardedOptions
    : [];
  const specifications: DomainSection[] = Array.isArray(parsed.specifications)
    ? parsed.specifications.map((s: { title?: string; items?: string[] }) => ({
        title: s.title || "Specifications",
        items: Array.isArray(s.items) ? s.items : [],
      }))
    : [];
  const currentState =
    parsed.currentState ||
    "Discussion completed up to the latest shared turn; deliverables recorded.";
  const pendingInquiry: string | undefined =
    typeof parsed.pendingInquiry === "string" && parsed.pendingInquiry.trim().length > 0
      ? parsed.pendingInquiry.trim()
      : undefined;

  const aiPrompt =
    parsed.aiPrompt ||
    buildMasterPrompt({
      title: conversation.title,
      source: conversation.source,
      category,
      objective,
      summary,
      decisions,
      discardedOptions,
      specifications,
      currentState,
      pendingInquiry,
    });

  const keyPoints = [
    `Objective: ${objective}`,
    ...decisions.map((d) => `${d.topic}: ${d.decision}`),
    `Current Status: ${currentState}`,
  ];

  const markdown = formatContextMarkdown({
    title: conversation.title,
    source: conversation.source,
    url: conversation.url,
    category,
    objective,
    summary,
    decisions,
    discardedOptions,
    specifications,
    currentState,
    pendingInquiry,
  });

  const jsonExport = {
    title: conversation.title,
    source: conversation.source,
    url: conversation.url,
    category,
    objective,
    summary,
    decisions,
    discardedOptions,
    specifications,
    currentState,
    pendingInquiry: pendingInquiry || null,
    aiPrompt,
    messageCount: conversation.messages.length,
    generatedWith: modelName,
    generatedAt: new Date().toISOString(),
  };

  return {
    category,
    objective,
    summary,
    decisions,
    discardedOptions,
    keyPoints,
    sections: specifications,
    currentState,
    pendingInquiry,
    aiPrompt,
    markdown,
    json: jsonExport,
  };
}

function generateAdaptiveFallback(conversation: NormalizedConversation): GeneratedContext {
  const { title, source, url, messages } = conversation;

  const fullText = messages.map((m) => m.content).join(" ").toLowerCase();

  // Domain detection heuristics using robust word-boundary matching
  const techScore = (
    fullText.match(
      /\b(function|const|let|var|class|interface|npm|yarn|pnpm|api|endpoints?|sdk|typescript|javascript|python|java|c\+\+|rust|golang|docker|kubernetes|sql|databases?|queries|schema|bugs?|debugging|stacktrace|compiler|repo|github|commit|frontend|backend|framework)\b/gi
    ) || []
  ).length;

  const creativeScore = (
    fullText.match(
      /\b(characters?|story|stories|protagonist|antagonist|chapters?|plot|novels?|fiction|dialogues?|narrative|scenes?|poems?|poetry|rhymes?|screenplay|scriptwriting|lore|worldbuilding|prose)\b/gi
    ) || []
  ).length;

  const businessScore = (
    fullText.match(
      /\b(revenue|market|marketing|customers?|pricing|startups?|saas|roi|pitch|investors?|sales|churn|conversion|cac|ltv|business plan|gpm|tam|b2b|b2c|campaigns?)\b/gi
    ) || []
  ).length;

  const academicScore = (
    fullText.match(
      /\b(hypothesis|hypotheses|methodology|paper|citations?|peer-reviewed|academic|study|experiment|abstract|literature review|dataset|theorem|proof)\b/gi
    ) || []
  ).length;

  const travelLifestyleScore = (
    fullText.match(
      /\b(itinerary|flights?|hotels?|trips?|travel|destinations?|vacations?|budget|sightseeing|packing|recipes?|cooking|workouts?|diet|nutrition|exercises?)\b/gi
    ) || []
  ).length;

  let category = "General Discussion & Planning";
  const scores = [
    { cat: "Software & Technical Architecture", score: techScore },
    { cat: "Creative Writing & Storytelling", score: creativeScore },
    { cat: "Business, Strategy & Marketing", score: businessScore },
    { cat: "Academic Research & Science", score: academicScore },
    { cat: "Travel, Lifestyle & Leisure", score: travelLifestyleScore },
  ];

  scores.sort((a, b) => b.score - a.score);
  if (scores[0].score >= 2) {
    category = scores[0].cat;
  }

  // First user prompt captures the initial goal
  const firstUserMsg = messages.find((m) => m.role === "user")?.content || "";
  const objective =
    firstUserMsg.slice(0, 360).replace(/\n+/g, " ") + (firstUserMsg.length > 360 ? "..." : "");

  // Last assistant turn captures latest state/output
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const lastAssistantMsg =
    assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].content : "";
  const currentState =
    lastAssistantMsg.slice(0, 450).replace(/\n+/g, " ") +
    (lastAssistantMsg.length > 450 ? "..." : "");

  // Detect if the conversation ended with an explicit pending user inquiry
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  let pendingInquiry: string | undefined = undefined;
  if (lastMessage && lastMessage.role === "user") {
    pendingInquiry = lastMessage.content.slice(0, 300).replace(/\n+/g, " ");
  } else if (lastAssistantMsg.includes("?") || lastAssistantMsg.toLowerCase().includes("would you like")) {
    const questionMatch = lastAssistantMsg.match(/([^.?!]*\?)/);
    if (questionMatch) {
      pendingInquiry = questionMatch[0].trim();
    }
  }

  // Extract explicit decisions from turns
  const decisions: DecisionItem[] = [];
  const discardedOptions: string[] = [];

  for (const msg of messages) {
    const text = msg.content;

    // Decision matching regex
    const decisionMatches = text.match(
      /(?:decided to|agreed on|we should use|let's go with|choose to|settled on|stick with|prefer|implement|switched to|opted for)\s+([^.\n]{10,140})/gi
    );
    if (decisionMatches) {
      for (const m of decisionMatches.slice(0, 3)) {
        decisions.push({
          topic: "Architecture & Direction Decision",
          decision: m.replace(/^(?:decided to|agreed on|we should use|let's go with|choose to|settled on|stick with|prefer|implement|switched to|opted for)\s+/i, "").trim(),
          rationale: "Selected during session discussions to optimize project requirements.",
        });
      }
    }

    // Discarded options regex
    const rejectedMatches = text.match(
      /(?:instead of|rather than|ruled out|avoided|rejected|not using)\s+([^.\n]{10,130})/gi
    );
    if (rejectedMatches) {
      for (const rm of rejectedMatches.slice(0, 3)) {
        discardedOptions.push(rm.trim());
      }
    }
  }

  // If no explicit decisions matched, synthesize from conversation objective
  if (decisions.length === 0) {
    decisions.push({
      topic: "Core Objective & Scope",
      decision: `Focused on: "${objective.slice(0, 120)}"`,
      rationale: "Established as the primary directive in user inquiries.",
    });
    if (assistantMessages.length > 0) {
      decisions.push({
        topic: "Execution Approach",
        decision: "Adopted structured iterative guidance addressing user inquiries directly.",
        rationale: "Agreed upon in discussion exchanges.",
      });
    }
  }

  // Deduplicate decisions
  const uniqueDecisions = decisions.filter(
    (d, index, self) => index === self.findIndex((t) => t.decision === d.decision)
  ).slice(0, 8);

  const uniqueDiscarded = Array.from(new Set(discardedOptions)).slice(0, 5);

  // Dynamic specifications based on domain (no emojis)
  const specifications: DomainSection[] = [];

  if (category === "Software & Technical Architecture") {
    specifications.push({
      title: "Technical Constraints & Stack Guidelines",
      items: [
        "Preserve existing architecture, dependencies, and file structures discussed in chat.",
        "Ensure all patches or code snippets align with established type definitions and APIs.",
        "Adhere to project code style: keep components clean, strongly typed, and modular.",
        "Maintain backwards compatibility for all exposed endpoints and schema fields.",
      ],
    });
    specifications.push({
      title: "Implementation & Error Handling Specifications",
      items: [
        "Implement graceful error handling, defensive input validation, and informative diagnostics.",
        "Avoid unnecessary external dependencies; prefer native framework primitives.",
      ],
    });
  } else if (category === "Creative Writing & Storytelling") {
    specifications.push({
      title: "Narrative & Creative Style Constraints",
      items: [
        "Maintain the tone, perspective, and worldbuilding established in the discussion.",
        "Follow character motivations, voice consistency, and previously agreed plot milestones.",
        "Show, don't tell: emphasize atmospheric details and emotional subtext.",
      ],
    });
    specifications.push({
      title: "Pacing & Dialogue Guidelines",
      items: [
        "Ensure narrative progression directly addresses established character stakes.",
        "Preserve distinctive character dialogue rhythms and subtext.",
      ],
    });
  } else if (category === "Business, Strategy & Marketing") {
    specifications.push({
      title: "Strategic & Market Parameters",
      items: [
        "Focus on the core target audience, value proposition, and business model agreed upon.",
        "Ensure roadmap milestones align with the defined budget and timeline constraints.",
        "Prioritize actions that optimize user acquisition, activation, and retention.",
      ],
    });
  } else if (category === "Academic Research & Science") {
    specifications.push({
      title: "Research Questions & Methodological Standards",
      items: [
        "Adhere to rigorous evidential standards and documented academic citations.",
        "Maintain the methodology and analytical framework developed in this discussion.",
      ],
    });
  } else if (category === "Travel, Lifestyle & Leisure") {
    specifications.push({
      title: "Logistics, Preferences & Recommendations",
      items: [
        "Incorporate prioritized itinerary items, dates, and destination highlights.",
        "Respect personal preferences, dietary/fitness goals, and budget constraints.",
      ],
    });
  } else {
    specifications.push({
      title: "Core Topics & Framework Guidelines",
      items: [
        "Detailed review and refinement of the conversation's core concepts.",
        "Resolution of primary questions with actionable continuation guidelines.",
      ],
    });
  }

  const summary = `In this ${source.toUpperCase()} session titled "${title}", the discussion focused on: "${objective}". Across ${messages.length} exchanges, core requirements were analyzed, technical and conceptual parameters were clarified, and the session reached the current stage: "${currentState}".`;

  const keyPoints = [
    `Objective: ${objective}`,
    ...uniqueDecisions.map((d) => `${d.topic}: ${d.decision}`),
    `Current Stage: ${currentState.slice(0, 160)}...`,
  ];

  const aiPrompt = buildMasterPrompt({
    title,
    source,
    category,
    objective,
    summary,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded,
    specifications,
    currentState,
    pendingInquiry,
  });

  const markdown = formatContextMarkdown({
    title,
    source,
    url,
    category,
    objective,
    summary,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded,
    specifications,
    currentState,
    pendingInquiry,
  });

  const jsonExport = {
    title,
    source,
    url,
    category,
    objective,
    summary,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded,
    specifications,
    currentState,
    pendingInquiry: pendingInquiry || null,
    aiPrompt,
    messageCount: messages.length,
    generatedWith: "adaptive-continuation-engine",
    generatedAt: new Date().toISOString(),
  };

  return {
    category,
    objective,
    summary,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded,
    keyPoints,
    sections: specifications,
    currentState,
    pendingInquiry,
    aiPrompt,
    markdown,
    json: jsonExport,
  };
}

function buildMasterPrompt({
  title,
  source,
  category,
  objective,
  summary,
  decisions,
  discardedOptions,
  specifications,
  currentState,
  pendingInquiry,
}: {
  title: string;
  source: string;
  category: string;
  objective: string;
  summary: string;
  decisions: DecisionItem[];
  discardedOptions?: string[];
  specifications: DomainSection[];
  currentState: string;
  pendingInquiry?: string;
}): string {
  const lines: string[] = [
    `# Context: ${title}`,
    `Platform: ${source.toUpperCase()} | Domain: ${category}`,
    "",
    "## Objective & Background",
    objective,
    "",
    "## Context & Conversation History",
    summary,
  ];

  if (decisions.length > 0) {
    lines.push("");
    lines.push("## Decisions Log & Choices");
    for (const d of decisions) {
      lines.push(
        `- **${d.topic}**: ${d.decision}${d.rationale ? ` (Rationale: ${d.rationale})` : ""}`
      );
    }
  }

  if (discardedOptions && discardedOptions.length > 0) {
    lines.push("");
    lines.push("## Discarded Alternatives & Constraints");
    for (const opt of discardedOptions) {
      lines.push(`- ${opt}`);
    }
  }

  if (specifications.length > 0) {
    lines.push("");
    lines.push("## Established Specifications");
    for (const spec of specifications) {
      lines.push(`### ${spec.title}`);
      for (const item of spec.items) {
        lines.push(`- ${item}`);
      }
    }
  }

  lines.push("");
  lines.push("## Current State & Latest Output");
  lines.push(currentState);

  if (pendingInquiry && pendingInquiry.trim().length > 0) {
    lines.push("");
    lines.push("## Pending Inquiry");
    lines.push(pendingInquiry.trim());
  }

  lines.push("");
  lines.push(
    "## Continuation Instructions\nResume the work seamlessly from the current state and address any pending inquiries without repeating previously established decisions or asking questions already resolved above."
  );

  return lines.join("\n");
}

function formatContextMarkdown({
  title,
  source,
  url,
  category,
  objective,
  summary,
  decisions,
  discardedOptions,
  specifications,
  currentState,
  pendingInquiry,
}: {
  title: string;
  source: string;
  url: string;
  category: string;
  objective: string;
  summary: string;
  decisions: DecisionItem[];
  discardedOptions?: string[];
  specifications: DomainSection[];
  currentState: string;
  pendingInquiry?: string;
}): string {
  const lines: string[] = [
    `# Context Document: ${title}`,
    "",
    `> **Platform**: [${source.toUpperCase()} Share Link](${url}) | **Domain**: ${category} | **Generated by**: Kontext Engine`,
    "",
    "## Objective",
    objective,
    "",
    "## Context & Conversation History",
    summary,
  ];

  if (decisions.length > 0) {
    lines.push("");
    lines.push("## Decisions Log");
    for (const d of decisions) {
      lines.push(
        `- **${d.topic}**: ${d.decision}${d.rationale ? ` (Rationale: ${d.rationale})` : ""}`
      );
    }
  }

  if (discardedOptions && discardedOptions.length > 0) {
    lines.push("");
    lines.push("## Discarded Alternatives");
    for (const opt of discardedOptions) {
      lines.push(`- ${opt}`);
    }
  }

  if (specifications.length > 0) {
    lines.push("");
    lines.push("## Specifications & Guidelines");
    for (const s of specifications) {
      lines.push(`### ${s.title}`);
      for (const item of s.items) {
        lines.push(`- ${item}`);
      }
    }
  }

  lines.push("");
  lines.push("## Current State & Latest Deliverables");
  lines.push(currentState);

  if (pendingInquiry && pendingInquiry.trim().length > 0) {
    lines.push("");
    lines.push("## Pending Inquiry");
    lines.push(pendingInquiry.trim());
  }

  return lines.join("\n");
}
