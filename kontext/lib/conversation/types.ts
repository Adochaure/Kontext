export type ProviderSource = "chatgpt" | "claude" | "gemini";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DomainSection {
  title: string;
  items: string[];
  content?: string;
}

export interface DecisionItem {
  topic: string;
  decision: string;
  rationale?: string;
  status?: "confirmed" | "possible" | "rejected" | "undecided";
}

export interface GeneratedContext {
  primaryDomain?: string;
  secondaryDomains?: string[];
  purpose?: string;
  conversationState?: string;
  category: string;
  objective: string;
  summary: string;
  decisions: DecisionItem[];
  discardedOptions?: string[];
  requirements?: string[];
  workCompleted?: string[];
  keyPoints: string[];
  sections: DomainSection[];
  currentState: string;
  nextSteps?: string[];
  pendingInquiry?: string;
  openQuestions?: string[];
  aiPrompt: string;
  markdown: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: Record<string, any>;
}

export interface NormalizedConversation {
  title: string;
  source: ProviderSource;
  url: string;
  messages: ConversationMessage[];
  context?: GeneratedContext;
}

export interface DetectResult {
  provider: ProviderSource;
  shareId: string;
  originalUrl: string;
  normalizedUrl: string;
  extraParams?: Record<string, string>;
}
