"use client";

import React, { useState, useEffect } from "react";
import { NormalizedConversation, GeneratedContext } from "@/lib/conversation/types";
import {
  Link2,
  FileText,
  Braces,
  Download,
  Sparkles,
  CheckCircle2,
  Eye,
  X,
  Check,
} from "lucide-react";

const SAMPLE_MESSAGES = [
  {
    role: "user" as const,
    name: "You",
    time: "Sep 19, 2026 10:14 PM",
    content: "Can you help me with a hackathon project idea?",
  },
  {
    role: "assistant" as const,
    name: "ChatGPT",
    time: "Sep 19, 2026 10:14 PM",
    content:
      "Sure! Here are some unique hackathon project ideas:\n\n1. AI-powered study buddy\n2. Conversation importer for all AI platforms\n3. Virtual herbal garden\n4. ...",
  },
  {
    role: "user" as const,
    name: "You",
    time: "Sep 19, 2026 10:15 PM",
    content: "Tell me more about the conversation importer idea.",
  },
  {
    role: "assistant" as const,
    name: "ChatGPT",
    time: "Sep 19, 2026 10:16 PM",
    content:
      "The conversation importer can:\n- Take a shared link from ChatGPT, Gemini, Claude\n- Extract the full conversation\n- Convert it to clean context\n- Allow download as .md or .json\n- Help you continue the chat in any AI platform\n\nIt would be super useful for students, developers, and researchers.",
  },
  {
    role: "user" as const,
    name: "You",
    time: "Sep 19, 2026 10:17 PM",
    content: "That sounds great! Can you help me design the UI?",
  },
];

const GENERATION_STEPS = [
  "Analyzing conversation turns...",
  "Extracting architectural decisions & trade-offs...",
  "Structuring domain specifications & active constraints...",
  "Finalizing master continuation prompt...",
];

export default function Maintool() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingContext, setIsGeneratingContext] = useState(false);
  const [generationStepIdx, setGenerationStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [conversation, setConversation] = useState<NormalizedConversation | null>(null);
  const [context, setContext] = useState<GeneratedContext | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [contextSuccess, setContextSuccess] = useState(false);

  // Mobile popup state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Step ticker during generation
  useEffect(() => {
    if (!isGeneratingContext) return;
    const interval = setInterval(() => {
      setGenerationStepIdx((prev) => (prev + 1) % GENERATION_STEPS.length);
    }, 450);
    return () => clearInterval(interval);
  }, [isGeneratingContext]);

  const showCopyToast = (label: string) => {
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopyToast(label);
    } catch {
      showCopyToast("Failed to copy");
    }
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please paste a conversation share link.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImportSuccess(false);
    setContextSuccess(false);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to import conversation.");
      }

      setConversation(data.conversation);
      setContext(data.context || data.conversation.context || null);
      setImportSuccess(true);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setImportSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContext = () => {
    if (!conversation) {
      setError("Please import a conversation link first.");
      return;
    }

    setIsGeneratingContext(true);
    setContextSuccess(false);

    setTimeout(() => {
      setIsGeneratingContext(false);
      setContextSuccess(true);
    }, 1400);
  };

  // Get active markdown export (context markdown if generated, else raw conversation)
  const getExportMarkdown = () => {
    if (contextSuccess && context?.markdown) {
      return context.markdown;
    }
    if (!conversation) return "";
    const header = `# ${conversation.title}\n\n**Source:** ${conversation.source.toUpperCase()} (${conversation.url})\n\n---\n\n`;
    const body = conversation.messages
      .map(
        (m) =>
          `### ${m.role === "user" ? "You" : conversation.source.toUpperCase()}\n\n${m.content}`
      )
      .join("\n\n---\n\n");
    return header + body;
  };

  // Get active JSON export
  const getExportJson = () => {
    if (contextSuccess && context?.json) {
      return JSON.stringify(context.json, null, 2);
    }
    return conversation ? JSON.stringify(conversation, null, 2) : "";
  };

  const providerDisplayName = conversation
    ? conversation.source === "chatgpt"
      ? "ChatGPT"
      : conversation.source === "claude"
      ? "Claude"
      : "Gemini"
    : "ChatGPT";

  const currentMessages = conversation
    ? conversation.messages.map((m) => ({
        role: m.role,
        name: m.role === "user" ? "You" : providerDisplayName,
        time: "Imported",
        content: m.content,
      }))
    : SAMPLE_MESSAGES;

  // Render message bubble component
  const renderChatBubbles = () => (
    <div className="space-y-3.5 pr-1">
      {currentMessages.map((msg, idx) => (
        <div key={idx} className="flex items-start gap-2.5">
          {/* Avatar */}
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
              msg.role === "user" ? "bg-[#E85023]" : "bg-[#111111]"
            }`}
          >
            {msg.role === "user" ? "U" : "AI"}
          </div>

          {/* Bubble Container */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1 px-1">
              <span className="font-bold text-black">{msg.name}</span>
              <span className="text-[10px] text-gray-500">{msg.time}</span>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 text-xs sm:text-sm text-black/90 shadow-sm whitespace-pre-wrap leading-relaxed break-words">
              {msg.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-black border border-[#ec4920] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <Check className="h-4 w-4 text-[#E85023]" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Main Grid: Equal Height Boxes on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ================= LEFT MAIN PANEL ================= */}
        <div className="h-auto rounded-3xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 shadow-xl lg:col-span-7 lg:h-[700px]">
          <div className="flex h-full flex-col justify-between rounded-[22px] border border-[#9f2b13] bg-[#EFECE8] p-5 sm:p-7">
          <div className="space-y-5">
            {/* 1. Paste Conversation Link */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base sm:text-lg font-bold text-black">
                  Paste Conversation Link
                </h2>

                {/* Mobile Preview Chat Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileChatOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 rounded-xl border-2 border-[#ec4920] bg-[#b9b6b6] px-2.5 py-1 text-xs font-bold text-black shadow-sm active:scale-95 transition"
                >
                  <Eye className="h-3.5 w-3.5 text-[#ec4920]" />
                  <span>Preview Chat ({conversation ? conversation.messages.length : SAMPLE_MESSAGES.length})</span>
                </button>
              </div>

              <form onSubmit={handleImport} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
                  <div className="flex-1 rounded-2xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 shadow-sm focus-within:ring-2 focus-within:ring-[#E85023]/40">
                    <div className="relative flex items-center rounded-xl border border-[#9f2b13] bg-white px-3.5 py-3">
                      <Link2 className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste your ChatGPT, Gemini, Claude or other AI conversation link..."
                        disabled={isLoading}
                        required
                        className="w-full bg-transparent text-xs text-black outline-none placeholder:text-gray-400 sm:text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="whitespace-nowrap rounded-2xl border border-[#E85023] bg-black p-1 text-xs font-bold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    <span className="flex items-center justify-center gap-2 rounded-xl border border-[#555] bg-black px-5 py-3 transition hover:bg-[#1a1a1a]">
                      {isLoading ? <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Importing...</span>
                      </> : <span>Import Conversation</span>}
                    </span>
                  </button>
                </div>

                <div className="text-[11px] sm:text-xs text-gray-600 px-1 pt-0.5">
                  Supports: <strong className="text-black font-semibold">ChatGPT</strong> • <strong className="text-black font-semibold">Gemini</strong> • <strong className="text-black font-semibold">Claude</strong> • Public Share Links
                </div>
              </form>

              {/* Green Flag: Import Successful */}
              {importSuccess && conversation && (
                <div className="mt-2.5 rounded-xl border border-emerald-500/50 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Import Successful: <strong>{conversation.title}</strong> ({conversation.messages.length} messages)
                    </span>
                  </div>
                  <span className="rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-emerald-900">
                    {conversation.source}
                  </span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-2.5 rounded-xl border border-red-300 bg-red-50 p-2.5 text-xs text-red-800 font-medium flex items-center gap-2">
                  <X className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            

            {/* 2. Generate Context */}
            <div>
              

              <button
                type="button"
                onClick={handleGenerateContext}
                disabled={isGeneratingContext}
                className={`w-full rounded-2xl border border-[#E85023] bg-black p-1 text-center transition active:scale-[0.99] cursor-pointer shadow-md ${
                  isGeneratingContext ? "ring-2 ring-[#E85023]/60" : "hover:bg-[#1c1c1c]"
                }`}
              >
                <div className="relative overflow-hidden rounded-xl border border-[#555] bg-black px-5 py-4">
                  {/* Generating Shimmer Animation */}
                  {isGeneratingContext && <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#E85023]/20 to-transparent animate-pulse" />}

                <div className="relative z-10 flex items-center justify-center gap-2 text-base font-bold text-white sm:text-lg">
                  <Sparkles
                    className={`h-5 w-5 text-[#E85023] ${
                      isGeneratingContext ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {isGeneratingContext ? "Synthesizing Context..." : "Generate Context"}
                  </span>
                </div>

                <p className="relative z-10 text-white/75 text-xs sm:text-sm mt-1">
                  {isGeneratingContext
                    ? GENERATION_STEPS[generationStepIdx]
                    : "Create a clean, structured context from this conversation"}
                </p>

                {/* Shimmer progress indicator */}
                {isGeneratingContext && (
                  <div className="relative z-10 mt-3 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E85023] animate-indeterminate" />
                  </div>
                )}
                </div>
              </button>

              {/* Green Flag: Context Generated */}
              {contextSuccess && (
                <div className="mt-2.5 rounded-xl border border-emerald-500/50 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Context Generated Successfully! Ready to export below.</span>
                  </div>
                  <span className="rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                    GPT-OSS 120B
                  </span>
                </div>
              )}
            </div>

            <hr className="border-[#D4431B]/25" />

            {/* 3. Export Generated Context */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-base sm:text-lg font-bold text-black">
                  Export Generated Context
                </h2>
                {contextSuccess && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    Continuation Ready
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Copy Markdown */}
                <button
                  type="button"
                  disabled={!conversation}
                  onClick={() =>
                    copyToClipboard(getExportMarkdown(), "Markdown Copied!")
                  }
                  className="rounded-2xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 text-black shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center justify-center gap-2.5 rounded-xl border border-[#9f2b13] bg-[#d9401c]/90 px-4 py-3 text-xs font-bold transition hover:bg-[#f05a34] sm:text-sm"><FileText className="h-4 w-4 shrink-0" />Copy Markdown</span>
                </button>

                {/* Copy JSON */}
                <button
                  type="button"
                  disabled={!conversation}
                  onClick={() =>
                    copyToClipboard(getExportJson(), "JSON Copied!")
                  }
                  className="rounded-2xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 text-black shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center justify-center gap-2.5 rounded-xl border border-[#9f2b13] bg-[#d9401c]/90 px-4 py-3 text-xs font-bold transition hover:bg-[#f05a34] sm:text-sm"><Braces className="h-4 w-4 shrink-0" />Copy JSON</span>
                </button>

                {/* Download Markdown */}
                <button
                  type="button"
                  disabled={!conversation}
                  onClick={() =>
                    downloadFile(
                      `${(conversation?.title || "context")
                        .replace(/[^a-z0-9]/gi, "_")
                        .toLowerCase()}.md`,
                      getExportMarkdown(),
                      "text/markdown"
                    )
                  }
                  className="rounded-2xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 text-black shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center justify-center gap-2.5 rounded-xl border border-[#9f2b13] bg-[#d9401c]/90 px-4 py-3 text-xs font-bold transition hover:bg-[#f05a34] sm:text-sm"><Download className="h-4 w-4 shrink-0" />Download Markdown</span>
                </button>

                {/* Download JSON */}
                <button
                  type="button"
                  disabled={!conversation}
                  onClick={() =>
                    downloadFile(
                      `${(conversation?.title || "context")
                        .replace(/[^a-z0-9]/gi, "_")
                        .toLowerCase()}.json`,
                      getExportJson(),
                      "application/json"
                    )
                  }
                  className="rounded-2xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 text-black shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex items-center justify-center gap-2.5 rounded-xl border border-[#9f2b13] bg-[#d9401c]/90 px-4 py-3 text-xs font-bold transition hover:bg-[#f05a34] sm:text-sm"><Download className="h-4 w-4 shrink-0" />Download JSON</span>
                </button>
              </div>
            </div>
          </div>

        </div>
        </div>

        {/* ================= RIGHT CHAT PREVIEW PANEL (Desktop) ================= */}
        <div className="hidden h-[700px] rounded-3xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 shadow-xl lg:col-span-5 lg:block">
          <div className="flex h-full flex-col rounded-[22px] border border-[#9f2b13] bg-[#EFECE8] p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-[#D4431B]/20 pb-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4431B]">
              Conversation Preview
            </span>
            <span className="text-[11px] font-semibold text-gray-600">
              {conversation ? `${conversation.messages.length} messages` : "Sample Preview"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderChatBubbles()}
          </div>
        </div>
        </div>
      </div>

      {/* ================= MOBILE CHAT PREVIEW POPUP ================= */}
      {isMobileChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg h-[82vh] rounded-3xl border border-[#8f250f]/60 bg-[#EFECE8] p-4 shadow-2xl ring-1 ring-inset ring-[#ec4920] sm:p-5 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between border-b border-[#D4431B]/25 pb-3 mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4431B] block">
                  Conversation Preview
                </span>
                <span className="text-[11px] font-medium text-gray-600">
                  {conversation ? `${conversation.title} (${conversation.messages.length} msgs)` : "Sample Preview"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileChatOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#D4431B]/40 bg-white text-black hover:bg-[#E85023] hover:text-white transition cursor-pointer shadow-sm"
                aria-label="Close Preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto">
              {renderChatBubbles()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
