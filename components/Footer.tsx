"use client";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-text-muted tracking-wider">
          [ SYSTEM READY ] © 2026 GGLOG_ARCHIVE
        </div>
        <div className="flex items-center gap-4">
          {["PRIVACY", "TERMS", "CONTACT"].map((link, i) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="
                font-[family-name:var(--font-jetbrains)] text-[10px] text-text-muted
                hover:text-lime transition-colors duration-200
                tracking-wider
              "
            >
              {i > 0 && <span className="mr-4">//</span>}
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
