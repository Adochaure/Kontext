import Navbar from "./components/Navbar";
import Page3 from "./components/Page3";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#F8F3F0] text-[#014BAA] selection:bg-[#014BAA] selection:text-[#F8F3F0]">
      {/* Global Navbar fixed on top of the hero */}
      <Navbar logoSrc="/logo.png" />

      {/* 3D Landing Section */}
      <div className="relative z-0 h-[100svh] w-full overflow-hidden">
        <Page3 showNavbar={false} />
      </div>

      <footer className="relative z-20 border-t border-[#014BAA]/30 bg-[#F8F3F0] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 text-center">
          <img src="/logo.png" alt="Kontext logo" className="h-10 w-10 rounded-xl object-cover" />
          <p className="text-sm italic text-[#014BAA]/70 sm:text-base">Made with time by Aditya aka AdoChuare.</p>
        </div>
      </footer>
    </div>
  );
}
