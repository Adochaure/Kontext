"use client";

/* eslint-disable @next/next/no-img-element */
import { Cpu } from "lucide-react";
import { useEffect, useState } from "react";

type Step = {
  number: string;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  background: string;
};

const STEPS: Step[] = [
  {
    number: "01", label: "Paste link", title: "Paste Public Share Link",
    subtitle: "Bring your existing AI conversation into Kontext.",
    image: "./1.png",
    alt: "Code and a laptop screen representing a shared conversation link", background: "bg-[#faf7f2]",
  },
  {
    number: "02", label: "Export", title: "Export Your Context",
    subtitle: "Turn the conversation into clean reusable formats.",
    image: "./2.png",
    alt: "Server connections representing exported context", background: "bg-[#f7f2ec]",
  },
  {
    number: "03", label: "Continue", title: "Continue Anywhere",
    subtitle: "Take the context into your next AI session.",
    image: "./3.png",
    alt: "Laptop representing continuing work in another AI session", background: "bg-[#f4f6f1]",
  },
];

export default function HowToUse() {
  const [activeStep, setActiveStep] = useState("01");

  useEffect(() => {
    const cards = STEPS.map(({ number }) => document.getElementById(`step-${number}`)).filter(
      (card): card is HTMLElement => Boolean(card),
    );
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveStep(visible.target.id.replace("step-", ""));
    }, { rootMargin: "-28% 0px -48% 0px", threshold: [0.15, 0.5, 0.8] });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const goToStep = (number: string) => {
    setActiveStep(number);
    document.getElementById(`step-${number}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-[#c8bfba] px-4 pb-24 pt-28 text-black sm:px-6 sm:pt-32 lg:px-8">
      <style>{`
        @keyframes enginePulse { 0%,100% { transform:scale(.95); box-shadow:0 0 0 0 rgba(236,73,32,.12) } 50% { transform:scale(1); box-shadow:0 0 0 10px rgba(236,73,32,.08),0 0 30px rgba(236,73,32,.24) } }
        @keyframes engineSpin { to { transform:rotate(360deg) } }
        .workflow-engine { animation:enginePulse 2.8s ease-in-out infinite }
        .workflow-ring { animation:engineSpin 7s linear infinite }
        @media (prefers-reduced-motion:reduce) { .workflow-engine,.workflow-ring { animation:none } }
      `}</style>
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-[#ec4920]/20 blur-3xl sm:h-96 sm:w-96" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[-10rem] top-1/2 h-80 w-80 rounded-full bg-[#1e463a]/15 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-12rem] left-1/3 h-80 w-80 rounded-full bg-[#faf7f2]/30 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-dotted border-[#8f250f]/60 bg-[#faf7f2] px-3.5 py-1 font-mono text-xs font-medium text-[#1e463a]"><span className="h-2 w-2 rounded-full bg-[#1e463a]" /> HOW IT WORKS / THREE-STEP WORKFLOW</div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-[#171717] sm:text-4xl lg:text-5xl">From raw conversation link to <span className="text-[#ec4920]">continuation-ready context</span>.</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#3f3e3e] sm:text-lg">Extract authentic decisions, preserve constraints, and move your context between AI tools in three simple steps.</p>
        </div>

        <nav aria-label="Workflow steps" className="sticky top-3 z-40 mb-5 flex justify-center sm:top-5 sm:mb-6">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-[#8f250f]/50 bg-[#ec4920]/95 p-1 shadow-lg shadow-[#5a1b09]/20 backdrop-blur-md">
            {STEPS.map((step) => {
              const current = activeStep === step.number;
              return <button key={step.number} type="button" onClick={() => goToStep(step.number)} aria-current={current ? "step" : undefined} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 font-mono text-xs transition-all duration-300 sm:px-4 sm:py-2.5 sm:text-sm ${current ? "border-[#faf7f2] bg-[#faf7f2] text-[#171717] shadow-sm" : "border-[#9f2b13] bg-[#d9401c]/80 text-black hover:bg-[#f05a34]"}`}><span className={current ? "text-[#ec4920]" : "opacity-60"}>{step.number}</span><span>{step.label}</span></button>;
            })}
          </div>
        </nav>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {STEPS.map((step, index) => <div key={step.number} className="contents md:relative md:block">
            <article id={`step-${step.number}`} className={`group relative min-h-[360px] overflow-hidden rounded-2xl border border-[#8f250f]/40 p-4 transition duration-500 hover:-translate-y-1 hover:border-[#8f250f]/70 hover:shadow-xl sm:p-5 ${step.background}`}>
              <span aria-hidden="true" className="pointer-events-none absolute right-3 top-[-8px] select-none font-mono text-[100px] font-bold leading-none text-[#8f250f]/[.2] sm:text-[120px]">{step.number}</span>
              <img src={step.image} alt={step.alt} className="h-[250px] w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-[1.03] sm:h-[260px]" />
              <div className="relative z-10 mt-5"><p className="mb-2 font-mono text-[10px] tracking-[.18em] text-[#1e463a]">STEP {step.number}</p><h3 className="text-xl font-semibold tracking-tight text-[#171717] sm:text-2xl">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#55504d]">{step.subtitle}</p></div>
            </article>
            {index === 0 && <ExtractionEngine />}
          </div>)}
        </div>
      </div>
    </section>
  );
}

function ExtractionEngine() {
  return <div className="relative z-20 my-1 flex h-24 items-center justify-center md:absolute md:left-[calc(100%+10px)] md:top-[170px] md:my-0 md:h-20 md:-translate-x-1/2">
    <div className="h-px w-12 bg-[#8f250f]/35 sm:w-16" />
    <div className="mx-2 flex flex-col items-center gap-1.5"><div className="workflow-engine relative flex h-14 w-14 items-center justify-center rounded-full border border-[#8f250f]/40 bg-[#faf7f2] shadow-lg sm:h-[72px] sm:w-[72px]"><span className="workflow-ring absolute inset-[7px] rounded-full border border-dashed border-[#ec4920]/50" /><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ec4920] text-white"><Cpu className="h-3.5 w-3.5" /></span></div><span className="whitespace-nowrap rounded-full border border-[#8f250f]/25 bg-[#faf7f2]/90 px-2 py-1 font-mono text-[7px] tracking-[.14em] text-[#696564]">CONTEXT EXTRACTION ENGINE</span></div>
    <div className="h-px w-12 bg-[#8f250f]/35 sm:w-16" />
  </div>;
}
