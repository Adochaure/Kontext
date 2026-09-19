import Navbar from "./components/Navbar";
import Page3 from "./components/Page3";
import HowToUse from "./components/HowToUse";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#c8bfba] text-black selection:bg-[#ec4920] selection:text-white">
      {/* Global Navbar fixed on top across both hero and HowToUse sections */}
      <Navbar logoSrc="/logo.png" />

      {/* 3D Landing Section - Sticky at top, pinned while HowToUse scrolls over it */}
      <div className="sticky top-0 z-0 h-[100svh] w-full overflow-hidden">
        <Page3 showNavbar={false} />
      </div>

      {/* How To Use Section - Overlaps and glides on top of the 3D landing hero on scroll */}
      <div className="relative z-10 bg-[#c8bfba] shadow-[0_-30px_70px_rgba(25,18,15,0.22)] border-t border-dotted border-[#8f250f]/30">
        <HowToUse />
      </div>
    </div>
  );
}
