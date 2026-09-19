"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import {
  Link2,
  FileText,
  Sparkles,
  CheckCircle2,
  Download,
  Copy,
  ArrowRight,
  Layers,
  Code2,
  Cpu,
  Compass,
} from "lucide-react";

export interface HowToUseCardProps {
  step: string;
  stepNumber: string;
  tag: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  bgClass: string;
  innerBgClass: string;
  features: string[];
}

const CARDS: HowToUseCardProps[] = [
  {
    stepNumber: "01",
    step: "STEP 01",
    tag: "UNIVERSAL INGESTION",
    title: "Paste Public Share Link",
    description:
      "Copy the public share URL from ChatGPT, Claude, or Gemini. Kontext fetches the full multi-turn discussion securely without browser extensions, logins, or API keys.",
    // Leave place for image: pass custom imageSrc anytime or keep the editorial visual
    imageSrc: "",
    imageAlt: "Paste conversation link interface mockup",
    bgClass: "bg-[#FAF7F2]",
    innerBgClass: "bg-[#F2EAE1]",
    features: [
      "Zero authentication or browser extensions required",
      "Preserves exact chronological dialogue turns",
      "Full support for ChatGPT, Claude, and Gemini",
    ],
  },
  {
    stepNumber: "02",
    step: "STEP 02",
    tag: "DUAL-FORMAT COMPILER",
    title: "Instant Dual-Format Export",
    description:
      "Instantly retrieve the raw transcript in structured formats. Download readable Markdown with code blocks intact, or structured JSON for programmatic workflows and offline archives.",
    // Leave place for image: pass custom imageSrc anytime or keep the editorial visual
    imageSrc: "",
    imageAlt: "Dual-format export Markdown and JSON mockup",
    bgClass: "bg-[#F7F2EC]",
    innerBgClass: "bg-[#ECE4DB]",
    features: [
      "Clean Markdown (.md) with code syntax preserved",
      "Standard JSON (.json) schema with turn metadata",
      "One-click copy to clipboard or direct file download",
    ],
  },
  {
    stepNumber: "03",
    step: "STEP 03",
    tag: "REASONING SYNTHESIS",
    title: "Synthesize Continuation Context",
    description:
      "Our continuation engine analyzes the full thread using openai/gpt-oss-120b to extract agreed decisions, active constraints, and discarded ideas—generating a ready-to-use prompt for your next AI session.",
    // Leave place for image: pass custom imageSrc anytime or keep the editorial visual
    imageSrc: "",
    imageAlt: "AI context synthesis decisions log mockup",
    bgClass: "bg-[#F4F6F1]",
    innerBgClass: "bg-[#EAEFE6]",
    features: [
      "Decision-aware synthesis via openai/gpt-oss-120b",
      "Zero emoji, clean editorial formatting",
      "Eliminates repetitive back-and-forth prompt engineering",
    ],
  },
];

export default function HowToUse() {
  return (
    <section
      id="how-it-works"
      className="relative w-full bg-[#c8bfba] text-black px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 selection:bg-[#ec4920] selection:text-white"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header with Clean Editorial Aesthetic */}
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-dotted border-[#8f250f]/60 bg-[#FAF7F2] px-3.5 py-1 text-xs font-mono font-medium text-[#1e463a] mb-5 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#1e463a]" />
            <span>HOW IT WORKS / THREE-STEP WORKFLOW</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#171717] leading-[1.15]">
            From raw conversation link to{" "}
            <span className="text-[#ec4920]">continuation-ready context</span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#3f3e3e] leading-relaxed">
            Extract authentic decisions, preserve constraints, and export structured prompts in three precise steps.
          </p>
        </div>

        {/* 3 Large Boxes Arranged Horizontally on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {CARDS.map((card, idx) => (
            <article
              key={card.stepNumber}
              className={`group flex flex-col justify-between h-full min-h-[620px] rounded-2xl border border-dotted border-[#8f250f]/60 ${card.bgClass} p-6 sm:p-7 transition-all duration-300 hover:shadow-lg hover:border-[#8f250f]`}
            >
              {/* Card Header: Step number & Tag */}
              <div>
                <div className="flex items-center justify-between border-b border-dotted border-[#8f250f]/30 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold tracking-widest text-[#1e463a] bg-[#e6f4ea] px-2.5 py-0.5 rounded-md border border-[#1e463a]/20">
                      {card.step}
                    </span>
                    <span className="text-[11px] font-mono tracking-wider text-[#696564] uppercase">
                      {card.tag}
                    </span>
                  </div>
                  <span className="font-mono text-xl font-light text-[#8f250f]/60">
                    /{card.stepNumber}
                  </span>
                </div>

                {/* DEDICATED IMAGE / VISUAL AREA (Top Half) */}
                <div className="relative mb-6 w-full h-[240px] sm:h-[260px] rounded-xl border border-dotted border-[#8f250f]/40 overflow-hidden bg-[#000000]/[0.02] flex flex-col items-center justify-center p-3 sm:p-4">
                  {/* If user provided an image source, display the image */}
                  {card.imageSrc ? (
                    <div className="h-full w-full relative">
                      <img
                        src={card.imageSrc}
                        alt={card.imageAlt || card.title}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    /* Clean Editorial Visual Mockup Placeholder (with place left for user image) */
                    <div className="h-full w-full flex flex-col justify-between">
                      {idx === 0 && <StepOneVisual />}
                      {idx === 1 && <StepTwoVisual />}
                      {idx === 2 && <StepThreeVisual />}
                    </div>
                  )}

                  {/* Subtle placeholder helper badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-[#FAF7F2]/90 border border-dotted border-[#8f250f]/40 px-2 py-0.5 text-[10px] font-mono text-[#696564] backdrop-blur-xs">
                    <span>ASSET SLOT {card.stepNumber}</span>
                  </div>
                </div>

                {/* Card Title */}
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717] mb-3">
                  {card.title}
                </h3>

                {/* Editorial Description */}
                <p className="text-sm text-[#444242] leading-relaxed mb-6 font-normal">
                  {card.description}
                </p>
              </div>

              {/* Card Footer: Verified Highlights */}
              <div className="pt-4 border-t border-dotted border-[#8f250f]/30">
                <ul className="space-y-2.5">
                  {card.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#2c2b2b]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1e463a] mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Action Strip - Clean Editorial Call to Action */}
        <div className="mt-14 sm:mt-18 rounded-2xl border border-dotted border-[#8f250f]/60 bg-[#FAF7F2] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#1e463a] uppercase tracking-wider mb-1">
              <Compass className="h-4 w-4 text-[#1e463a]" />
              <span>Direct Execution</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-[#171717]">
              Ready to import a discussion and continue without losing context?
            </h4>
            <p className="text-sm text-[#504e4e] mt-1">
              Paste any ChatGPT, Claude, or Gemini link to preview and export instantly.
            </p>
          </div>

          <Link
            href="/import"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#ec4920] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#8f250f] shrink-0"
          >
            <span>Launch Context Importer</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Visual mockups for each step (used when no external image is passed) **/

function StepOneVisual() {
  return (
    <div className="h-full w-full flex flex-col justify-between text-left select-none">
      {/* Search / URL pill */}
      <div className="w-full rounded-lg border border-[#8f250f]/30 bg-white/90 px-3 py-2 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Link2 className="h-3.5 w-3.5 text-[#ec4920] shrink-0" />
          <span className="font-mono text-[11px] text-[#333] truncate">
            https://chatgpt.com/share/6aaedb1d...
          </span>
        </div>
        <span className="shrink-0 font-mono text-[9px] font-semibold text-[#1e463a] bg-[#e6f4ea] px-1.5 py-0.5 rounded border border-[#1e463a]/30">
          VALID
        </span>
      </div>

      {/* Supported Platforms chips */}
      <div className="grid grid-cols-3 gap-2 my-2">
        <div className="rounded-md border border-dotted border-[#8f250f]/30 bg-white/60 p-2 text-center">
          <span className="font-mono text-[10px] font-semibold text-[#171717] block">ChatGPT</span>
          <span className="text-[9px] text-[#1e463a] font-mono">Public Share</span>
        </div>
        <div className="rounded-md border border-dotted border-[#8f250f]/30 bg-white/60 p-2 text-center">
          <span className="font-mono text-[10px] font-semibold text-[#171717] block">Claude</span>
          <span className="text-[9px] text-[#1e463a] font-mono">Share URL</span>
        </div>
        <div className="rounded-md border border-dotted border-[#8f250f]/30 bg-white/60 p-2 text-center">
          <span className="font-mono text-[10px] font-semibold text-[#171717] block">Gemini</span>
          <span className="text-[9px] text-[#1e463a] font-mono">Export Link</span>
        </div>
      </div>

      {/* Dialogue preview pill */}
      <div className="rounded-lg border border-[#8f250f]/20 bg-[#F2EAE1]/80 p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-[#ec4920] text-white flex items-center justify-center text-[10px] font-mono font-bold">
            U
          </div>
          <span className="font-mono text-[11px] text-[#2c2b2b] truncate max-w-[130px] sm:max-w-[150px]">
            Architecture proposal for...
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#1e463a] font-semibold">11 Turns</span>
      </div>
    </div>
  );
}

function StepTwoVisual() {
  return (
    <div className="h-full w-full flex flex-col justify-between text-left select-none">
      {/* Top badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#1e463a]" />
          <span className="font-mono text-[11px] font-semibold text-[#171717]">FORMAT SELECTION</span>
        </div>
        <span className="font-mono text-[9px] text-[#1e463a] bg-[#e6f4ea] px-2 py-0.5 rounded border border-[#1e463a]/30">
          READY
        </span>
      </div>

      {/* Dual Document Cards */}
      <div className="grid grid-cols-2 gap-2 my-1">
        {/* Markdown Card */}
        <div className="rounded-lg border border-[#8f250f]/30 bg-white/90 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] font-bold text-[#ec4920]">.MD</span>
            <FileText className="h-3 w-3 text-[#696564]" />
          </div>
          <div className="font-mono text-[9px] text-[#555] line-clamp-2 leading-tight">
            # Session Transcript<br />
            **User**: Migrate to...
          </div>
          <div className="mt-2 pt-1 border-t border-dotted border-[#8f250f]/20 flex items-center justify-between text-[9px] font-mono text-[#1e463a]">
            <span>Download</span>
            <Download className="h-2.5 w-2.5" />
          </div>
        </div>

        {/* JSON Card */}
        <div className="rounded-lg border border-[#8f250f]/30 bg-white/90 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] font-bold text-[#1e463a]">.JSON</span>
            <Code2 className="h-3 w-3 text-[#696564]" />
          </div>
          <div className="font-mono text-[9px] text-[#555] line-clamp-2 leading-tight">
            &#123; &quot;turns&quot;: 11,<br />
            &quot;model&quot;: &quot;chatgpt&quot; &#125;
          </div>
          <div className="mt-2 pt-1 border-t border-dotted border-[#8f250f]/20 flex items-center justify-between text-[9px] font-mono text-[#1e463a]">
            <span>Copy Raw</span>
            <Copy className="h-2.5 w-2.5" />
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="rounded-md border border-[#8f250f]/20 bg-[#ECE4DB]/80 px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#444]">
        <span>Syntactic formatting intact</span>
        <span className="text-[#1e463a] font-semibold">100% Offline Ready</span>
      </div>
    </div>
  );
}

function StepThreeVisual() {
  return (
    <div className="h-full w-full flex flex-col justify-between text-left select-none">
      {/* Top Model Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-[#ec4920]" />
          <span className="font-mono text-[10px] font-bold text-[#171717]">openai/gpt-oss-120b</span>
        </div>
        <span className="font-mono text-[9px] text-[#1e463a] bg-[#e6f4ea] px-1.5 py-0.5 rounded border border-[#1e463a]/30 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1e463a] animate-pulse" />
          ACTIVE
        </span>
      </div>

      {/* Structured Decision Preview Box */}
      <div className="rounded-lg border border-[#8f250f]/30 bg-white/95 p-2.5 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-[#1e463a]" />
          <span className="font-mono text-[10px] font-bold text-[#1e463a]">
            DECISIONS &amp; CONSTRAINTS LOG
          </span>
        </div>
        <div className="space-y-1 text-[9px] font-mono text-[#333]">
          <div className="flex items-start gap-1">
            <span className="text-[#ec4920] font-bold">•</span>
            <span className="truncate">Decision: Use 120B model for 131k token window</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-[#ec4920] font-bold">•</span>
            <span className="truncate">Constraint: Emoji-free, zero hardcoded filler</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-[#ec4920] font-bold">•</span>
            <span className="truncate">Current State: Ready for downstream integration</span>
          </div>
        </div>
      </div>

      {/* Copy Prompt Strip */}
      <div className="rounded-md border border-[#8f250f]/20 bg-[#EAEFE6]/80 px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-[#2c2b2b]">
        <span className="truncate max-w-[140px] text-[#1e463a] font-semibold">Prompt Ready To Continue</span>
        <span className="text-[#ec4920] font-mono font-medium">1-Click Copy</span>
      </div>
    </div>
  );
}
