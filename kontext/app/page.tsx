import Navbar from "./components/Navbar";
import Page3 from "./components/Page3";
import HowToUse from "./components/HowToUse";
import Features from "./components/Features";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#c8bfba] text-black selection:bg-[#ec4920] selection:text-white">
      {/* Global Navbar fixed on top across both hero and HowToUse sections */}
      <Navbar logoSrc="/logo.png" />

      {/* 3D Landing Section - Sticky at top, pinned while HowToUse scrolls over it */}
      <div className="sticky top-0 z-0 h-[100svh] w-full overflow-hidden">
        <Page3 showNavbar={false} />
      </div>

      {/* Workflow scrolls as part of the page while the landing stays pinned behind it. */}
      <div className="relative z-10 bg-[#c8bfba] shadow-[0_-30px_70px_rgba(25,18,15,0.22)] border-t border-dotted border-[#8f250f]/30">
        <HowToUse />
      </div>

      {/* Features naturally scrolls upward over the sticky workflow layer. */}
      <div className="relative z-20 border-t border-[#8f250f]/30">
        <Features />
      </div>

      <footer className="relative z-20 border-t border-[#8f250f]/30 bg-[#c8bfba] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 text-center">
          <img src="/logo.png" alt="Kontext logo" className="h-10 w-10 rounded-xl object-cover" />
          <p className="text-sm italic text-[#3f3e3e] sm:text-base">Made with time by Aditya aka AdoChuare.</p>
        </div>
      </footer>
    </div>
  );
}
