import Navbar from "../components/Navbar";
import Maintool from "../components/Maintool";

export const metadata = {
  title: "Import Conversation & Generate Context | Kontext",
  description:
    "Extract real decisions, active constraints, and continuation context from public ChatGPT or Claude conversation links.",
};

export default function ImportPage() {
  return (
    <div className="relative min-h-[100svh] w-full bg-[#c8bfba] text-black selection:bg-[#ec4920] selection:text-white overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar logoSrc="/logo.png" />

      {/* Ambient background glows matching landing theme */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-35 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-[#ec4920]/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-[#5a1b09]/20 blur-3xl" />
        <div className="absolute left-[-10rem] top-1/2 h-80 w-80 rounded-full bg-[#1e463a]/20 blur-3xl" />
        <div className="absolute bottom-[-9rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#faf7f2]/35 blur-3xl" />
      </div>

      {/* Main Content Area - Centered to Screen */}
      <main className="relative z-10 mx-auto w-full max-w-[1360px] px-3 sm:px-6 md:px-8 pt-20 pb-8 min-h-[calc(100vh-20px)] flex items-center justify-center">
        <Maintool />
      </main>
    </div>
  );
}
