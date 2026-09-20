import {
  DecisionItem,
  DomainSection,
  GeneratedContext,
  NormalizedConversation,
} from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

/**
 * Main entry point: domain-agnostic conversation to continuation context compiler.
 */
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
      console.warn(
        `Groq primary model (${PRIMARY_MODEL}) failed, trying fallback model:`,
        primaryErr
      );
      try {
        const fallbackResult = await callGroqModel(conversation, apiKey, FALLBACK_MODEL);
        if (fallbackResult) return fallbackResult;
      } catch (fallbackErr) {
        console.warn(`Groq fallback model (${FALLBACK_MODEL}) also failed:`, fallbackErr);
      }
    }
  }

  // Adaptive domain-agnostic fallback generator when no API key or API call fails
  return generateAdaptiveFallback(conversation);
}

/**
 * LLM-based compilation via Groq using comprehensive domain-agnostic architecture.
 */
async function callGroqModel(
  conversation: NormalizedConversation,
  apiKey: string,
  modelName: string
): Promise<GeneratedContext | null> {
  // Format up to 100 conversation turns with generous depth (120B model has 131k context window)
  const formattedTranscript = conversation.messages
    .slice(0, 100)
    .map(
      (m, idx) =>
        `[TURN ${idx + 1} - ${m.role === "user" ? "USER" : "ASSISTANT"}]:\n${m.content.slice(0, 8000)}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are the Senior Conversation-to-Continuation Context Compiler for "Kontext".

Your mission is NOT to simply summarize conversations. You are a compiler that transforms an imported multi-turn conversation into the highest-fidelity, domain-adapted continuation brief so another AI can seamlessly continue the user's work, reasoning, learning, writing, or discussion with ZERO loss of substance.

CORE PRINCIPLE:
Imagine the original conversation disappears completely. Give only your compiled context to another AI. That recipient AI MUST be able to continue the conversation naturally without asking the user to repeat established decisions, constraints, or completed work. Remove redundancy, not substance.

CRITICAL INSTRUCTIONS:
1. DOMAIN-AGNOSTIC EXTRACTION:
The conversation may be about ANY subject. Do NOT assume the conversation is technical, software-related, or project-related.
First determine the Primary Domain, Secondary Domains (if mixed), Purpose, and Conversation State:
- Software development / programming / debugging
- Studying and exam preparation / education
- Research and academic inquiry
- Writing, editing, and content creation
- Business, startups, and product planning
- Career planning and skill acquisition
- Planning, travel, and logistics
- Creative work, worldbuilding, and storytelling
- Personal advice, decision-making, and open discussion
- Mixed-domain conversations (e.g. Startup Idea -> Tech Stack -> Landing Page Copy -> Marketing)
Do NOT force every conversation into a generic software or project template. Adapt the structure to what matters for that domain.

2. ADAPT EXTRACTION TO THE DOMAIN:
- IF CODING: Preserve requirements, architecture, tech stack, code snippets, APIs, schemas, bugs, errors, implementation decisions, folder structure, commands, configuration, and TODOs.
- IF STUDY / EDUCATION: Preserve subject, topic, syllabus, exam requirements, concepts explained, definitions, formulas, examples, important distinctions, questions asked, answers developed, study plan, revision strategy, weak areas, preferred explanation style, and unfinished topics.
- IF WRITING / EDITING: Preserve purpose of writing, target audience, tone, style, structure, key messages, required points, words/phrases to include, things to avoid, drafts, latest approved version, and requested changes with revision history.
- IF RESEARCH: Preserve research question, scope, important findings, sources/references, evidence, competing viewpoints, conclusions supported by evidence, unresolved questions, assumptions, terminology, and next research steps. Do not convert nuanced findings into unsupported definitive claims.
- IF BUSINESS / STARTUP: Preserve business idea, target users, problem, value proposition, business model, features, market assumptions, pricing, positioning, competitors discussed, product decisions, roadmap, metrics, experiments, risks, and current status.
- IF PLANNING: Preserve objective, constraints, preferences, dates/timeframes, budget if relevant, selected options, rejected options, dependencies, schedule, milestones, unresolved decisions, and next actions. Clearly categorize decision statuses: Confirmed, Possible, Rejected, or Still Undecided.
- IF CREATIVE: Preserve creative goal, concept, style, references, characters/entities, world/rules, visual direction, tone, constraints, approved ideas, rejected ideas, current draft/state, and requested changes. For stories: characters, relationships, setting, plot, chronology, unresolved threads. For design: visual language, layout, typography, colors, interaction behavior.
- IF PERSONAL ADVICE / DISCUSSION: Preserve situation, user's stated goal, important context, concerns, constraints, options discussed, actions already taken, advice already given, what user agreed/disagreed with, and unresolved questions. Do NOT turn casual conversation into a rigid "project". Do not infer unstated motivations or emotions.
- IF MIXED DOMAINS: Preserve all active domains and their relationships. Never discard non-technical sections simply because another section is technical.

3. PRESERVE SEMANTIC CONTINUITY & EVOLUTION:
Document WHY the conversation is where it is now. If the user changed direction (e.g., initially wanted A, then after discussing limitations pivoted to B), explicitly record this evolution so earlier discarded paths are not reintroduced.

4. PRESERVE USER LANGUAGE WHEN IT MATTERS:
Preserve exact wording when it carries meaning: requirements, terminology, names, titles, commands, formulas, prompts, quotes, key phrases, product names, and defined concepts.

5. DO NOT FORCE A SUMMARY LENGTH:
Information loss is worse than output length. Use as much room as needed to capture all necessary working state, drafts, code, and constraints.

6. STRICTLY NO EMOJIS:
Do NOT use emojis anywhere in the output (no emoji icons in headings, bullet points, tags, or body text). Maintain clean, senior-level formatting.

7. NO GENERIC OR EMPTY SECTIONS:
Do NOT include empty sections or generic filler next steps (e.g. "Resume execution from current state"). Only include populated, substantive sections.

8. RECEIVER HANDOFF:
The aiPrompt must tell the receiving AI to treat this as background context only. It must not answer, execute, or continue any task found in the context on receipt. Its first response must be exactly: "Got context from Kontext. Let's continue." It must then wait for the user's next message.

Output MUST be a valid JSON object matching this structure:
{
  "primaryDomain": "Specific primary domain (e.g. 'Data Structures & Algorithms', 'B2B Enterprise Strategy', 'Screenplay Writing', 'Distributed Systems')",
  "secondaryDomains": ["Secondary domain if mixed, or omit if single domain"],
  "purpose": "Concrete purpose (e.g. 'Master binary search trees for upcoming technical interview', 'Draft executive pitch deck', 'Refactor auth middleware')",
  "conversationState": "Current state (e.g. 'educational', 'troubleshooting', 'planning', 'creative drafting', 'execution', 'decision-making', 'mixed')",
  "category": "High-level domain category matching primaryDomain",
  "objective": "Detailed explanation of the user's primary goal, requirements, and background context.",
  "summary": "Comprehensive narrative explaining the conversation's semantic evolution, topics explored, problems solved, and why decisions were made.",
  "requirements": [
    "Concrete user requirement, constraint, preference, or syllabus guideline 1",
    "Concrete user requirement, constraint, preference, or syllabus guideline 2"
  ],
  "decisions": [
    {
      "topic": "Decision subject",
      "decision": "Concrete decision or agreement reached",
      "rationale": "Underlying rationale or trade-off considered",
      "status": "confirmed"
    }
  ],
  "discardedOptions": [
    "Alternative method, proposal, or topic ruled out and reason why"
  ],
  "workCompleted": [
    "Concrete deliverable created, code written, topic mastered, draft finalized, or milestone reached"
  ],
  "domainSections": [
    {
      "title": "Domain-specific section title (e.g. 'Tech Stack & Architecture', 'Concepts & Formulas Explained', 'Draft & Revision History', 'Research Findings & Sources', 'Planning Milestones & Dependencies')",
      "items": [
        "Substantive domain detail, code snippet, concept breakdown, or draft text"
      ]
    }
  ],
  "currentState": "Exhaustive description of the exact state, latest approved draft, active code, or standing conclusion reached at the close of conversation.",
  "nextSteps": [
    "Authentic, specific immediate next action established in the discussion"
  ],
  "pendingInquiry": "If the conversation ended with an unresolved question or pending user instruction, state it clearly. Otherwise leave as empty string.",
  "openQuestions": [
    "Unresolved question, open decision point, or pending topic"
  ],
  "aiPrompt": "Master AI continuation prompt in clean markdown without emojis, equipping any recipient AI to resume seamlessly with full context."
}`;

  const userPrompt = `Conversation Title: "${conversation.title}"
Platform: ${conversation.source}
Total Turns: ${conversation.messages.length}

Complete Transcript:
${formattedTranscript}

Compile the domain-agnostic continuation context JSON object now.`;

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
      max_tokens: 7000,
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

  const primaryDomain = parsed.primaryDomain || parsed.category || "General Discussion & Planning";
  const secondaryDomains: string[] = Array.isArray(parsed.secondaryDomains)
    ? parsed.secondaryDomains
    : [];
  const purpose = parsed.purpose || `Accomplish the goal set forth in: ${conversation.title}`;
  const conversationState = parsed.conversationState || "ongoing";
  const category = parsed.category || primaryDomain;
  const objective = parsed.objective || purpose;
  const summary = parsed.summary || "Conversation context compiled successfully.";

  const requirements: string[] = Array.isArray(parsed.requirements)
    ? parsed.requirements.filter((r: unknown) => typeof r === "string" && r.trim().length > 0)
    : [];

  const decisions: DecisionItem[] = Array.isArray(parsed.decisions)
    ? parsed.decisions.map(
        (d: { topic?: string; decision?: string; rationale?: string; status?: string }) => ({
          topic: d.topic || "Core Decision",
          decision: d.decision || "",
          rationale: d.rationale || undefined,
          status: (["confirmed", "possible", "rejected", "undecided"].includes(d.status || "")
            ? d.status
            : "confirmed") as DecisionItem["status"],
        })
      )
    : [];

  const discardedOptions: string[] = Array.isArray(parsed.discardedOptions)
    ? parsed.discardedOptions.filter((opt: unknown) => typeof opt === "string" && opt.trim().length > 0)
    : [];

  const workCompleted: string[] = Array.isArray(parsed.workCompleted)
    ? parsed.workCompleted.filter((w: unknown) => typeof w === "string" && w.trim().length > 0)
    : [];

  const domainSections: DomainSection[] = Array.isArray(parsed.domainSections)
    ? parsed.domainSections.map((s: { title?: string; items?: string[]; content?: string }) => ({
        title: s.title || "Domain Specifications",
        items: Array.isArray(s.items) ? s.items : [],
        content: typeof s.content === "string" ? s.content : undefined,
      }))
    : Array.isArray(parsed.specifications)
    ? parsed.specifications.map((s: { title?: string; items?: string[] }) => ({
        title: s.title || "Domain Specifications",
        items: Array.isArray(s.items) ? s.items : [],
      }))
    : [];

  const currentState =
    parsed.currentState ||
    "Discussion completed up to the latest shared turn; deliverables recorded.";

  const nextSteps: string[] = Array.isArray(parsed.nextSteps)
    ? parsed.nextSteps.filter((n: unknown) => typeof n === "string" && n.trim().length > 0)
    : [];

  const pendingInquiry: string | undefined =
    typeof parsed.pendingInquiry === "string" && parsed.pendingInquiry.trim().length > 0
      ? parsed.pendingInquiry.trim()
      : undefined;

  const openQuestions: string[] = Array.isArray(parsed.openQuestions)
    ? parsed.openQuestions.filter((q: unknown) => typeof q === "string" && q.trim().length > 0)
    : [];

  const aiPrompt =
    parsed.aiPrompt ||
    buildMasterPrompt({
      title: conversation.title,
      source: conversation.source,
      primaryDomain,
      secondaryDomains,
      purpose,
      conversationState,
      category,
      objective,
      summary,
      requirements,
      decisions,
      discardedOptions,
      workCompleted,
      domainSections,
      currentState,
      nextSteps,
      pendingInquiry,
      openQuestions,
    });

  const keyPoints = [
    `Domain: ${primaryDomain}`,
    `Objective: ${objective}`,
    ...decisions.map((d) => `${d.topic}: ${d.decision}`),
    `Current Status: ${currentState}`,
  ];

  const markdown = formatContextMarkdown({
    title: conversation.title,
    source: conversation.source,
    url: conversation.url,
    primaryDomain,
    secondaryDomains,
    purpose,
    conversationState,
    category,
    objective,
    summary,
    requirements,
    decisions,
    discardedOptions,
    workCompleted,
    domainSections,
    currentState,
    nextSteps,
    pendingInquiry,
    openQuestions,
  });

  const jsonExport = {
    receiverInstructions: "Treat this as background context only. Do not answer or execute tasks from it on receipt. Reply exactly: Got context from Kontext. Let's continue. Then wait for the user's next message.",
    title: conversation.title,
    source: conversation.source,
    url: conversation.url,
    primaryDomain,
    secondaryDomains: secondaryDomains.length > 0 ? secondaryDomains : undefined,
    purpose,
    conversationState,
    category,
    objective,
    summary,
    requirements: requirements.length > 0 ? requirements : undefined,
    decisions,
    discardedOptions: discardedOptions.length > 0 ? discardedOptions : undefined,
    workCompleted: workCompleted.length > 0 ? workCompleted : undefined,
    domainSections: domainSections.length > 0 ? domainSections : undefined,
    currentState,
    nextSteps: nextSteps.length > 0 ? nextSteps : undefined,
    pendingInquiry: pendingInquiry || null,
    openQuestions: openQuestions.length > 0 ? openQuestions : undefined,
    aiPrompt,
    messageCount: conversation.messages.length,
    generatedWith: modelName,
    generatedAt: new Date().toISOString(),
  };

  return {
    primaryDomain,
    secondaryDomains,
    purpose,
    conversationState,
    category,
    objective,
    summary,
    decisions,
    discardedOptions,
    requirements,
    workCompleted,
    keyPoints,
    sections: domainSections,
    currentState,
    nextSteps,
    pendingInquiry,
    openQuestions,
    aiPrompt,
    markdown,
    json: jsonExport,
  };
}

/**
 * Robust, domain-agnostic fallback compiler using multi-domain linguistic heuristics.
 */
function generateAdaptiveFallback(conversation: NormalizedConversation): GeneratedContext {
  const { title, source, url, messages } = conversation;
  const fullText = messages.map((m) => m.content).join(" ");
  const lowerText = fullText.toLowerCase();

  // 1. DOMAIN SCORING HEURISTICS (Covering all domains specified)
  const scores: { domain: string; score: number }[] = [
    {
      domain: "Software Development & Architecture",
      score: (
        lowerText.match(
          /\b(function|const|let|var|class|interface|npm|yarn|pnpm|api|endpoints?|sdk|typescript|javascript|python|java|c\+\+|rust|golang|docker|kubernetes|sql|databases?|queries|schema|bugs?|debugging|stacktrace|compiler|repo|github|commit|frontend|backend|framework|next\.js|react|tailwind|css|html|devops|aws|gcp)\b/gi
        ) || []
      ).length,
    },
    {
      domain: "Study & Exam Preparation",
      score: (
        lowerText.match(
          /\b(exam|syllabus|study|studying|test|quiz|semester|course|chapter|definitions?|formulas?|theorems?|homework|lecture|textbook|revision|memorize|flashcards?|grade|mcq|practice questions?|solve this problem|explain the concept)\b/gi
        ) || []
      ).length,
    },
    {
      domain: "Writing & Content Editing",
      score: (
        lowerText.match(
          /\b(essay|draft|article|blog post|copywriting|headline|paragraph|proofread|revise|rewording|tone|audience|active voice|grammar|editing|prose|synopsis|manuscript|press release|newsletter|hook)\b/gi
        ) || []
      ).length,
    },
    {
      domain: "Research & Academic Analysis",
      score: (
        lowerText.match(
          /\b(hypothesis|hypotheses|methodology|paper|citations?|peer-reviewed|academic|study|experiment|abstract|literature review|dataset|correlation|statistical|empirical|findings|bibliography|doi)\b/gi
        ) || []
      ).length,
    },
    {
      domain: "Business & Startup Strategy",
      score: (
        lowerText.match(
          /\b(revenue|market|marketing|customers?|pricing|startups?|saas|roi|pitch|investors?|sales|churn|conversion|cac|ltv|business plan|gpm|tam|b2b|b2c|campaigns?|value proposition|monetization|runway|bootstrapping)\b/gi
        ) || []
      ).length,
    },
    {
      domain: "Planning & Logistics",
      score: (
        lowerText.match(
          /\b(itinerary|schedule|milestones?|timeline|deadlines?|dates?|flights?|hotels?|booking|budget|dependencies|roadmap|calendar|destination|packing|checklist|phases?|allocations?)\b/gi
        ) || []
      ).length,
    },
    {
      domain: "Creative Work & Storytelling",
      score: (
        lowerText.match(
          /\b(characters?|story|stories|protagonist|antagonist|plot|novels?|fiction|dialogues?|narrative|scenes?|lore|worldbuilding|setting|climax|screenplay|scriptwriting|illustration|visual design|aesthetic)\b/gi
        ) || []
      ).length,
    },
    {
      domain: "Personal Advice & Decision Discussion",
      score: (
        lowerText.match(
          /\b(career|job offer|resume|interview|salary|personal situation|advice|dilemma|relationship|habit|routine|decision|pros and cons|what should i do|feeling stuck|perspective|recommendation)\b/gi
        ) || []
      ).length,
    },
  ];

  scores.sort((a, b) => b.score - a.score);

  const primaryDomain = scores[0].score >= 2 ? scores[0].domain : "General Discussion & Exploration";
  const secondaryDomains: string[] = scores
    .slice(1)
    .filter((s) => s.score >= 3 && s.score >= scores[0].score * 0.35)
    .map((s) => s.domain);

  const category = secondaryDomains.length > 0
    ? `Mixed Domain (${primaryDomain} & ${secondaryDomains[0]})`
    : primaryDomain;

  // 2. CONVERSATION PURPOSE & STATE DETECTION
  const firstUserMsg = messages.find((m) => m.role === "user")?.content || "";
  const firstUserLower = firstUserMsg.toLowerCase();

  let purpose = `Address: ${firstUserMsg.slice(0, 180).replace(/\n+/g, " ")}`;
  if (firstUserLower.startsWith("how to") || firstUserLower.startsWith("how do i")) {
    purpose = `Learn procedural execution for: ${firstUserMsg.slice(0, 160).replace(/\n+/g, " ")}`;
  } else if (firstUserLower.includes("debug") || firstUserLower.includes("error") || firstUserLower.includes("fix")) {
    purpose = `Diagnose and resolve issues in: ${firstUserMsg.slice(0, 160).replace(/\n+/g, " ")}`;
  } else if (firstUserLower.includes("plan") || firstUserLower.includes("itinerary")) {
    purpose = `Develop structured plan and schedule for: ${firstUserMsg.slice(0, 160).replace(/\n+/g, " ")}`;
  } else if (firstUserLower.includes("write") || firstUserLower.includes("draft") || firstUserLower.includes("edit")) {
    purpose = `Compose and refine content for: ${firstUserMsg.slice(0, 160).replace(/\n+/g, " ")}`;
  } else if (firstUserLower.includes("study") || firstUserLower.includes("prepare") || firstUserLower.includes("exam")) {
    purpose = `Master curriculum and exam preparation for: ${firstUserMsg.slice(0, 160).replace(/\n+/g, " ")}`;
  }

  let conversationState = "ongoing";
  if (lowerText.includes("error") || lowerText.includes("bug") || lowerText.includes("fails")) {
    conversationState = "troubleshooting";
  } else if (lowerText.includes("syllabus") || lowerText.includes("explain") || lowerText.includes("concept")) {
    conversationState = "instructional";
  } else if (lowerText.includes("schedule") || lowerText.includes("timeline") || lowerText.includes("milestone")) {
    conversationState = "planning";
  } else if (lowerText.includes("draft") || lowerText.includes("revision") || lowerText.includes("edit")) {
    conversationState = "creative drafting & editing";
  } else if (lowerText.includes("decision") || lowerText.includes("choose") || lowerText.includes("agreed")) {
    conversationState = "decision-making";
  }

  const objective = firstUserMsg.length > 0
    ? firstUserMsg.slice(0, 360).replace(/\n+/g, " ") + (firstUserMsg.length > 360 ? "..." : "")
    : `Execute collaboration initiated in: ${title}`;

  // 3. CURRENT STATE & LATEST OUTPUT EXTRACTION
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const lastAssistantMsg =
    assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].content : "";
  const currentState =
    lastAssistantMsg.slice(0, 480).replace(/\n+/g, " ") +
    (lastAssistantMsg.length > 480 ? "..." : "");

  // 4. PENDING INQUIRY DETECTION
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  let pendingInquiry: string | undefined = undefined;
  if (lastMessage && lastMessage.role === "user") {
    pendingInquiry = lastMessage.content.slice(0, 320).replace(/\n+/g, " ");
  } else if (lastAssistantMsg.includes("?") || lastAssistantMsg.toLowerCase().includes("would you like")) {
    const questionMatch = lastAssistantMsg.match(/([^.?!]*\?)/);
    if (questionMatch) {
      pendingInquiry = questionMatch[0].trim();
    }
  }

  // 5. EXTRACT REQUIREMENTS & PREFERENCES
  const requirements: string[] = [];
  const reqMatches = fullText.match(
    /(?:must|need to|require|required|should have|make sure to|only use|do not|don't|avoid|prefer|preference)\s+([^.\n]{10,120})/gi
  );
  if (reqMatches) {
    for (const rm of reqMatches.slice(0, 5)) {
      const cleanReq = rm.replace(/^(?:must|need to|require|required|should have|make sure to|only use|do not|don't|avoid|prefer|preference)\s+/i, "").trim();
      if (cleanReq.length > 10) requirements.push(cleanReq);
    }
  }

  // 6. EXTRACT DECISIONS WITH CONFIRMED / DISCARDED STATUS
  const decisions: DecisionItem[] = [];
  const discardedOptions: string[] = [];

  for (const msg of messages) {
    const text = msg.content;

    // Confirmed decisions
    const decisionMatches = text.match(
      /(?:decided to|agreed on|we should use|let's go with|choose to|settled on|stick with|selected|opted for|switched to)\s+([^.\n]{10,140})/gi
    );
    if (decisionMatches) {
      for (const dm of decisionMatches.slice(0, 3)) {
        decisions.push({
          topic: "Established Direction",
          decision: dm.replace(/^(?:decided to|agreed on|we should use|let's go with|choose to|settled on|stick with|selected|opted for|switched to)\s+/i, "").trim(),
          rationale: "Selected during discussion exchanges.",
          status: "confirmed",
        });
      }
    }

    // Discarded options
    const rejectedMatches = text.match(
      /(?:instead of|rather than|ruled out|avoided|rejected|not using|no longer|dropped)\s+([^.\n]{10,130})/gi
    );
    if (rejectedMatches) {
      for (const rm of rejectedMatches.slice(0, 3)) {
        discardedOptions.push(rm.trim());
      }
    }
  }

  // If no explicit decision matched, synthesize from objective
  if (decisions.length === 0) {
    decisions.push({
      topic: "Core Objective & Scope",
      decision: `Established focus on: "${objective.slice(0, 140)}"`,
      rationale: "Explicitly defined as the required goal in user prompt.",
      status: "confirmed",
    });
    if (assistantMessages.length > 0) {
      decisions.push({
        topic: "Execution Pattern & Standards",
        decision: "Adopted structured iterative delivery and validated specifications.",
        rationale: "Selected to ensure clean implementation without technical debt.",
        status: "confirmed",
      });
    }
  }

  const uniqueDecisions = decisions.filter(
    (d, index, self) => index === self.findIndex((t) => t.decision === d.decision)
  ).slice(0, 8);

  const uniqueDiscarded = Array.from(new Set(discardedOptions)).slice(0, 5);

  // 7. EXTRACT WORK COMPLETED & CODE/DRAFT SNIPPETS
  const workCompleted: string[] = [];
  const codeBlocks = fullText.match(/```[a-z]*\n([\s\S]*?)```/gi);
  if (codeBlocks && codeBlocks.length > 0) {
    workCompleted.push(`Generated ${codeBlocks.length} functional code or data deliverables.`);
  }
  if (assistantMessages.length > 0) {
    workCompleted.push("Evaluated and answered primary questions across dialogue turns.");
  }

  // 8. DYNAMIC DOMAIN-SPECIFIC SECTIONS
  const domainSections: DomainSection[] = [];

  if (primaryDomain.includes("Software")) {
    domainSections.push({
      title: "Architecture & Tech Stack Specifications",
      items: [
        "Preserve existing architecture, dependencies, and file structures discussed in chat.",
        "Ensure all patches or code snippets align with established type definitions and APIs.",
        "Adhere to modular code standards; keep functions typed and avoid unnecessary external packages.",
        "Maintain backwards compatibility across all public interfaces and state schemas.",
      ],
    });
    if (codeBlocks && codeBlocks.length > 0) {
      domainSections.push({
        title: "Active Code Implementations",
        items: codeBlocks.slice(0, 2).map((cb) => cb.slice(0, 260) + "..."),
      });
    }
  } else if (primaryDomain.includes("Study")) {
    domainSections.push({
      title: "Syllabus Topics & Core Concepts",
      items: [
        `Subject Area: ${title}`,
        "Mastery focus: Concept definitions, working examples, and exam-oriented problem-solving.",
        "Retention strategy: Focus explanation depth on high-frequency question patterns.",
        "Unfinished areas: Continue seamlessly to pending syllabus modules without restarting covered fundamentals.",
      ],
    });
  } else if (primaryDomain.includes("Writing")) {
    domainSections.push({
      title: "Editorial Guidelines & Draft Structure",
      items: [
        "Target Audience & Tone: Maintain the voice, register, and stylistic constraints agreed upon.",
        "Structural Requirements: Ensure logical narrative progression across all sections.",
        "Revision History: Incorporate requested changes into subsequent drafts while preserving finalized passages.",
      ],
    });
  } else if (primaryDomain.includes("Research")) {
    domainSections.push({
      title: "Research Inquiries & Evidential Framework",
      items: [
        "Research Scope: Focused on established evidence, documented sources, and analytical rigor.",
        "Analytical Rigor: Distinguish empirical findings from working assumptions.",
        "Unresolved Inquiries: Deepen analysis on open theoretical questions.",
      ],
    });
  } else if (primaryDomain.includes("Business")) {
    domainSections.push({
      title: "Business Model & Product Strategy",
      items: [
        "Value Proposition: Emphasize core user problem and differentiating advantages.",
        "Go-To-Market & Economics: Align execution steps with target customer acquisition channels and budget limits.",
        "Milestones: Prioritize actions that de-risk market assumptions.",
      ],
    });
  } else if (primaryDomain.includes("Planning")) {
    domainSections.push({
      title: "Planning Milestones & Dependencies",
      items: [
        "Confirmed Timeline: Coordinate actions around established dates and milestones.",
        "Constraint Management: Adhere to budget, logistics, and scheduling requirements.",
        "Decision Matrix: Distinguish confirmed commitments from exploratory proposals.",
      ],
    });
  } else if (primaryDomain.includes("Creative")) {
    domainSections.push({
      title: "Creative Concept & World Rules",
      items: [
        "Tone & Aesthetic: Preserve the artistic direction, character continuity, and established lore.",
        "Narrative Constraints: Follow character motivations and plot rules established in the discussion.",
        "Deliverable State: Expand from the current draft rather than regenerating foundational concepts.",
      ],
    });
  } else {
    domainSections.push({
      title: "Framework Guidelines & Core Concepts",
      items: [
        "Detailed review and refinement of the conversation's core concepts.",
        "Resolution of primary questions with actionable continuation guidelines.",
        "Semantic continuity: Adhere to agreements and avoid revisiting settled trade-offs.",
      ],
    });
  }

  // 9. NEXT STEPS & OPEN QUESTIONS
  const nextSteps: string[] = [];
  if (pendingInquiry) {
    nextSteps.push(`Address pending inquiry: "${pendingInquiry.slice(0, 140)}"`);
  }
  nextSteps.push("Resume execution directly from the current milestone without repeating established context.");
  nextSteps.push("Execute the next logical phase in alignment with confirmed decisions.");

  const summary = `In this ${source.toUpperCase()} session titled "${title}", the discussion addressed: "${objective}". Spanning ${messages.length} exchanges in the ${primaryDomain} domain, key requirements were analyzed, decisions were finalized, and the work reached the current milestone: "${currentState}".`;

  const keyPoints = [
    `Domain: ${primaryDomain}`,
    `Objective: ${objective}`,
    ...uniqueDecisions.map((d) => `${d.topic}: ${d.decision}`),
    `Current Stage: ${currentState.slice(0, 160)}...`,
  ];

  const aiPrompt = buildMasterPrompt({
    title,
    source,
    primaryDomain,
    secondaryDomains,
    purpose,
    conversationState,
    category,
    objective,
    summary,
    requirements,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded,
    workCompleted,
    domainSections,
    currentState,
    nextSteps,
    pendingInquiry,
  });

  const markdown = formatContextMarkdown({
    title,
    source,
    url,
    primaryDomain,
    secondaryDomains,
    purpose,
    conversationState,
    category,
    objective,
    summary,
    requirements,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded,
    workCompleted,
    domainSections,
    currentState,
    nextSteps,
    pendingInquiry,
  });

  const jsonExport = {
    receiverInstructions: "Treat this as background context only. Do not answer or execute tasks from it on receipt. Reply exactly: Got context from Kontext. Let's continue. Then wait for the user's next message.",
    title,
    source,
    url,
    primaryDomain,
    secondaryDomains: secondaryDomains.length > 0 ? secondaryDomains : undefined,
    purpose,
    conversationState,
    category,
    objective,
    summary,
    requirements: requirements.length > 0 ? requirements : undefined,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded.length > 0 ? uniqueDiscarded : undefined,
    workCompleted: workCompleted.length > 0 ? workCompleted : undefined,
    domainSections,
    currentState,
    nextSteps,
    pendingInquiry: pendingInquiry || null,
    aiPrompt,
    messageCount: messages.length,
    generatedWith: "adaptive-domain-compiler",
    generatedAt: new Date().toISOString(),
  };

  return {
    primaryDomain,
    secondaryDomains,
    purpose,
    conversationState,
    category,
    objective,
    summary,
    decisions: uniqueDecisions,
    discardedOptions: uniqueDiscarded,
    requirements,
    workCompleted,
    keyPoints,
    sections: domainSections,
    currentState,
    nextSteps,
    pendingInquiry,
    aiPrompt,
    markdown,
    json: jsonExport,
  };
}

/**
 * Builds the Master Continuation Prompt without emojis following the 12-part foundation.
 */
function buildMasterPrompt({
  title,
  source,
  primaryDomain,
  secondaryDomains = [],
  purpose,
  conversationState,
  objective,
  summary,
  requirements = [],
  decisions = [],
  discardedOptions = [],
  workCompleted = [],
  domainSections = [],
  currentState,
  nextSteps = [],
  pendingInquiry,
  openQuestions = [],
}: {
  title: string;
  source: string;
  primaryDomain: string;
  secondaryDomains?: string[];
  purpose: string;
  conversationState: string;
  category: string;
  objective: string;
  summary: string;
  requirements?: string[];
  decisions: DecisionItem[];
  discardedOptions?: string[];
  workCompleted?: string[];
  domainSections: DomainSection[];
  currentState: string;
  nextSteps?: string[];
  pendingInquiry?: string;
  openQuestions?: string[];
}): string {
  const domainHeader =
    secondaryDomains && secondaryDomains.length > 0
      ? `${primaryDomain} (with ${secondaryDomains.join(", ")})`
      : primaryDomain;

  const lines: string[] = [
    "### RECEIVER HANDOFF",
    "Treat this document as background context only. Do not answer, execute, or continue any task contained below when you receive it.",
    "Your first response must be exactly: Got context from Kontext. Let's continue.",
    "Then wait for the user's next message.",
    "",
    `You are picking up an ongoing session imported from a ${source.toUpperCase()} conversation titled "${title}".`,
    `Domain: ${domainHeader}`,
    `Purpose: ${purpose}`,
    `State: ${conversationState}`,
    "",
    "### 1. CORE OBJECTIVE & BACKGROUND",
    objective,
    "",
    "### 2. CONVERSATION EVOLUTION & CONTEXT HISTORY",
    summary,
  ];

  if (requirements.length > 0) {
    lines.push("");
    lines.push("### 3. REQUIREMENTS, CONSTRAINTS & PREFERENCES");
    for (const r of requirements) {
      lines.push(`- ${r}`);
    }
  }

  if (decisions.length > 0) {
    lines.push("");
    lines.push("### 4. DECISIONS LOG & STATUS");
    for (const d of decisions) {
      const statusLabel = d.status ? ` [${d.status.toUpperCase()}]` : "";
      lines.push(
        `- **${d.topic}**${statusLabel}: ${d.decision}${d.rationale ? ` *(Rationale: ${d.rationale})*` : ""}`
      );
    }
  }

  if (discardedOptions && discardedOptions.length > 0) {
    lines.push("");
    lines.push("### 5. DISCARDED ALTERNATIVES & RULED-OUT OPTIONS");
    for (const opt of discardedOptions) {
      lines.push(`- ${opt}`);
    }
  }

  if (workCompleted && workCompleted.length > 0) {
    lines.push("");
    lines.push("### 6. WORK COMPLETED & MILESTONES ACHIEVED");
    for (const item of workCompleted) {
      lines.push(`- ${item}`);
    }
  }

  if (domainSections.length > 0) {
    lines.push("");
    lines.push("### 7. DOMAIN-SPECIFIC SPECIFICATIONS & ACTIVE WORKING STATE");
    for (const sec of domainSections) {
      lines.push(`#### ${sec.title}`);
      if (sec.content) {
        lines.push(sec.content);
      }
      if (sec.items && sec.items.length > 0) {
        for (const item of sec.items) {
          lines.push(`- ${item}`);
        }
      }
    }
  }

  lines.push("");
  lines.push("### 8. CURRENT STATE & LATEST DELIVERABLES");
  lines.push(currentState);

  if (pendingInquiry && pendingInquiry.trim().length > 0) {
    lines.push("");
    lines.push("### 9. PENDING INQUIRY & UNRESOLVED QUESTIONS");
    lines.push(pendingInquiry.trim());
  } else if (openQuestions && openQuestions.length > 0) {
    lines.push("");
    lines.push("### 9. OPEN QUESTIONS & UNRESOLVED DECISIONS");
    for (const q of openQuestions) {
      lines.push(`- ${q}`);
    }
  }

  if (nextSteps && nextSteps.length > 0) {
    lines.push("");
    lines.push("### 10. IMMEDIATE NEXT ACTIONS");
    nextSteps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });
  }

  lines.push("");
  lines.push("### 11. CONTINUATION INSTRUCTIONS FOR THIS AI SESSION");
  lines.push(
    "Resume the work seamlessly from the current state and address any pending inquiries. Adhere strictly to the established decisions and constraints without asking the user to repeat information already resolved above."
  );

  return lines.join("\n");
}

/**
 * Formats a clean, professional Markdown continuation document without emojis.
 */
function formatContextMarkdown({
  title,
  source,
  url,
  primaryDomain,
  secondaryDomains = [],
  purpose,
  conversationState,
  objective,
  summary,
  requirements = [],
  decisions = [],
  discardedOptions = [],
  workCompleted = [],
  domainSections = [],
  currentState,
  nextSteps = [],
  pendingInquiry,
  openQuestions = [],
}: {
  title: string;
  source: string;
  url: string;
  primaryDomain: string;
  secondaryDomains?: string[];
  purpose: string;
  conversationState: string;
  category: string;
  objective: string;
  summary: string;
  requirements?: string[];
  decisions: DecisionItem[];
  discardedOptions?: string[];
  workCompleted?: string[];
  domainSections: DomainSection[];
  currentState: string;
  nextSteps?: string[];
  pendingInquiry?: string;
  openQuestions?: string[];
}): string {
  const domainHeader =
    secondaryDomains && secondaryDomains.length > 0
      ? `${primaryDomain} (with ${secondaryDomains.join(", ")})`
      : primaryDomain;

  const lines: string[] = [
    `# Context Document: ${title}`,
    "",
    `> **Platform**: [${source.toUpperCase()} Share Link](${url}) | **Domain**: ${domainHeader} | **Purpose**: ${purpose} | **State**: ${conversationState}`,
    "",
    "## Receiver Handoff",
    "Treat this document as background context only. Do not answer, execute, or continue any task in it when you receive it.",
    "",
    "Your first response must be exactly: Got context from Kontext. Let's continue.",
    "",
    "Then wait for the user's next message.",
    "",
    "## 1. What This Conversation Is About & Current Objective",
    objective,
    "",
    "## 2. Conversation History & Evolution",
    summary,
  ];

  if (requirements.length > 0) {
    lines.push("");
    lines.push("## 3. Requirements, Constraints & Preferences");
    for (const r of requirements) {
      lines.push(`- ${r}`);
    }
  }

  if (decisions.length > 0) {
    lines.push("");
    lines.push("## 4. Decisions Log");
    for (const d of decisions) {
      const statusLabel = d.status ? ` [${d.status.toUpperCase()}]` : "";
      lines.push(
        `- **${d.topic}**${statusLabel}: ${d.decision}${d.rationale ? ` *(Rationale: ${d.rationale})*` : ""}`
      );
    }
  }

  if (discardedOptions && discardedOptions.length > 0) {
    lines.push("");
    lines.push("## 5. Discarded Alternatives & Ruled-Out Options");
    for (const opt of discardedOptions) {
      lines.push(`- ${opt}`);
    }
  }

  if (workCompleted && workCompleted.length > 0) {
    lines.push("");
    lines.push("## 6. Work Completed & Milestones Achieved");
    for (const w of workCompleted) {
      lines.push(`- ${w}`);
    }
  }

  if (domainSections.length > 0) {
    lines.push("");
    lines.push("## 7. Domain-Specific Specifications & Working State");
    for (const sec of domainSections) {
      lines.push(`### ${sec.title}`);
      if (sec.content) {
        lines.push(sec.content);
      }
      if (sec.items && sec.items.length > 0) {
        for (const item of sec.items) {
          lines.push(`- ${item}`);
        }
      }
    }
  }

  lines.push("");
  lines.push("## 8. Current State & Latest Deliverables");
  lines.push(currentState);

  if (pendingInquiry && pendingInquiry.trim().length > 0) {
    lines.push("");
    lines.push("## 9. Pending Inquiry");
    lines.push(pendingInquiry.trim());
  } else if (openQuestions && openQuestions.length > 0) {
    lines.push("");
    lines.push("## 9. Open Questions & Unresolved Decisions");
    for (const q of openQuestions) {
      lines.push(`- ${q}`);
    }
  }

  if (nextSteps && nextSteps.length > 0) {
    lines.push("");
    lines.push("## 10. Plans & Immediate Next Steps");
    nextSteps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });
  }

  lines.push("");
  lines.push("## 11. Continuation Instructions");
  lines.push(
    "Resume the work seamlessly from the current state and address any pending inquiries without repeating previously established decisions or asking questions already resolved above."
  );

  return lines.join("\n");
}
