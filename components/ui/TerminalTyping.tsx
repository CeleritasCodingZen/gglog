"use client";

import { useEffect, useState, useRef } from "react";

interface TerminalTypingProps {
  text: string;
  speed?: number; // ms per character
  delay?: number; // ms before starting
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
}

export default function TerminalTyping({
  text,
  speed = 30,
  delay = 0,
  onComplete,
  className = "",
  showCursor = true,
  cursorChar = "_",
}: TerminalTypingProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    indexRef.current = 0;
    setDisplayedText("");
    setIsComplete(false);

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed, onComplete]);

  if (!hasStarted) {
    return (
      <span className={className}>
        {showCursor && (
          <span className="animate-pulse">{cursorChar}</span>
        )}
      </span>
    );
  }

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="animate-pulse">{cursorChar}</span>
      )}
      {showCursor && isComplete && (
        <span
          style={{ animation: "blink 1s step-end infinite" }}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}
