export type ProviderSource = "chatgpt" | "claude" | "gemini";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DomainSection {
  title: string;
  items: string[];
}

export interface DecisionItem {
  topic: string;
  decision: string;
  rationale?: string;
}

export interface GeneratedContext {
  category: string;
  objective: string;
  summary: string;
  decisions: DecisionItem[];
  discardedOptions?: string[];
  keyPoints: string[];
  sections: DomainSection[];
  currentState: string;
  nextSteps?: string[];
  pendingInquiry?: string;
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
