"use client";

import { useEffect, useRef, useState } from "react";

interface GlitchTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p" | "div";
  className?: string;
  glowOnHover?: boolean;
  periodicGlitch?: boolean;
  glitchInterval?: number; // ms, default ~10000
}

export default function GlitchText({
  text,
  as: Tag = "span",
  className = "",
  glowOnHover = false,
  periodicGlitch = false,
  glitchInterval = 10000,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!periodicGlitch) return;

    const startGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    };

    // Random offset so not all elements glitch simultaneously
    const randomDelay = Math.random() * 4000;
    const timeout = setTimeout(() => {
      startGlitch();
      intervalRef.current = setInterval(startGlitch, glitchInterval + Math.random() * 4000);
    }, randomDelay);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [periodicGlitch, glitchInterval]);

  return (
    <Tag
      className={`
        relative inline-block
        ${glowOnHover ? "rgb-split-hover" : ""}
        ${isGlitching ? "glitch-periodic" : ""}
        ${className}
      `}
      data-text={text}
    >
      {text}
    </Tag>
  );
}
