interface NavbarProps {
  logoSrc: string;
}

export default function Navbar({ logoSrc }: NavbarProps) {
  const navItems = [
    {
      label: "How it works",
      link: "#how-it-works",
      hideOnMobile: true,
    },
    {
      label: "Features",
      link: "#features",
      hideOnMobile: true,
    },
    {
      label: "GitHub",
      link: "https://github.com/Adochaure",
      isGitHub: true,
    },
  ];

  return (
    <nav className="fixed inset-x-0 top-2 z-50 flex justify-center px-2 sm:top-3 sm:px-4">
      <div className="flex max-w-full items-center gap-1 rounded-2xl border border-[#8f250f]/60 bg-[#ec4920]/90 p-1 shadow-lg shadow-[#5a1b09]/20 backdrop-blur-md">

        {/* Logo */}
        <button className="rounded-xl bg-[#b9b6b6] px-1 py-1 text-sm font-light text-black transition duration-200 hover:bg-[#4a4949]">
          <img
            src={logoSrc}
            alt="Logo"
            className="h-10 w-10 rounded-xl border-none object-cover sm:h-12 sm:w-12 md:h-14 md:w-14"
          />
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-1 rounded-2xl border border-[#8f250f]/50 bg-[#d9401c]/90 p-1">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : undefined}
              rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`${item.hideOnMobile ? "hidden sm:flex" : "flex"} h-10 items-center justify-center whitespace-nowrap rounded-xl border border-[#9f2b13] px-3 text-sm text-black transition duration-200 hover:border-[#5a1b09] hover:bg-[#f05a34] sm:h-12 sm:px-4 sm:text-base md:h-14 md:px-5 md:text-lg`}
            >
              {item.isGitHub ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current sm:h-8 sm:w-8"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12a9.998 9.998 0 0 0 6.838 9.488c.5.092.682-.217.682-.482 0-.237-.009-1.024-.013-1.858-2.782.604-3.369-1.18-3.369-1.18-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.09-.646.349-1.087.635-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.092.39-1.985 1.029-2.685-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.756c.85.004 1.706.115 2.505.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.377.203 2.394.1 2.647.64.7 1.028 1.593 1.028 2.685 0 3.842-2.339 4.687-4.566 4.935.359.31.679.92.679 1.855 0 1.34-.012 2.419-.012 2.749 0 .267.18.578.688.48A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
                </svg>
              ) : (
                item.label
              )}
              {item.isGitHub && <span className="sr-only">GitHub</span>}
            </a>
          ))}
        </div>

        {/* Import Context */}
        <button className="whitespace-nowrap rounded-xl bg-black px-2 py-1 text-sm font-light text-white transition duration-200 hover:bg-[#898989] sm:px-3">
          <a
            href="#import-context"
            className="flex h-10 items-center justify-center rounded-xl border-none px-2 text-sm sm:h-12 sm:px-4 sm:text-xl md:h-14 md:px-5 md:text-xl"
          >
            Import Context
          </a>
        </button>

      </div>
    </nav>
  );
}
