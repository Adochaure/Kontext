"use client";

import { useEffect, useState } from "react";

const FEATURES = [
  ["01", "Conversation extraction", "Turn a public AI conversation into portable context in seconds."],
  ["02", "Decisions preserved", "Keep the choices, rationale, and important outcomes that shape your work."],
  ["03", "Constraints retained", "Carry requirements, boundaries, and technical details into the next session."],
  ["04", "Clean export formats", "Use a structured format that is easy to read, save, and reuse."],
  ["05", "Tool-independent context", "Move your work between AI tools without starting the conversation over."],
  ["06", "Ready to continue", "Pick up your project with clear, complete context wherever you work next."],
  ["07", "Privacy-first design", "Your conversations are never stored or shared, and your context is always under your control."],
] as const;

export default function Features() {
  const [filled, setFilled] = useState<number[]>([]);

  useEffect(() => {
    const rows = FEATURES.map((_, index) => document.getElementById(`feature-${index}`)).filter(
      (row): row is HTMLElement => Boolean(row),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.featureIndex));
        if (entered.length) setFilled((current) => [...new Set([...current, ...entered])]);
      },
      { rootMargin: "-20% 0px -25% 0px", threshold: 0.25 },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="relative overflow-hidden  bg-[#c8bfba] px-4 pb-28 pt-20 text-[#171717]  sm:px-6 sm:pt-24 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-8 h-72 w-72 rounded-full bg-[#ec4920]/20 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 bottom-12 h-64 w-64 rounded-full bg-[#1e463a]/15 blur-3xl sm:h-80 sm:w-80" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <p className="mb-4 font-mono text-xs tracking-[.2em] text-[#1e463a]">WHAT YOU KEEP</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Context that stays <span className="text-[#ec4920]">useful.</span></h2>
          <p className="mt-4 text-base leading-relaxed text-[#55504d] sm:text-lg">Every extracted conversation is shaped to help you continue, not just look back.</p>
        </div>

        <div className="space-y-2.5">
          {FEATURES.map(([number, title, description], index) => {
            const active = filled.includes(index);
            return (
              <article id={`feature-${index}`} data-feature-index={index} key={number} className={`group relative isolate overflow-hidden rounded-xl border p-4 transition-colors duration-700 sm:px-5 sm:py-4 ${active ? "border-[#ec4920] text-white" : "border-[#8f250f]/30 bg-white text-[#171717]"}`}>
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 -z-10 w-full origin-left bg-[#ec4920] transition-transform duration-1000 ease-out ${active ? "scale-x-100" : "scale-x-0"}`} />
                <div className="grid gap-2.5 sm:grid-cols-[62px_1fr] sm:items-center sm:gap-4">
                  <span className={`font-mono text-sm tracking-[.18em] transition-colors duration-700 ${active ? "text-white/70" : "text-[#ec4920]"}`}>{number}</span>
                  <div><h3 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h3><p className={`mt-1 max-w-2xl text-sm leading-relaxed transition-colors duration-700 ${active ? "text-white/80" : "text-[#55504d]"}`}>{description}</p></div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
