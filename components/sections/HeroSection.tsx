"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import PixelButton from "../ui/PixelButton";
import GlitchText from "../ui/GlitchText";
import TerminalTyping from "../ui/TerminalTyping";
import GameCardStack from "./GameCardStack";

export default function HeroSection({ isReady }: { isReady: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const playRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const rememberRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isReady) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      taglineRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5 }
    )
      .fromTo(
        playRef.current,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 0.6 },
        "+=0.1"
      )
      .fromTo(
        logRef.current,
        { opacity: 0, x: -80 },
        { opacity: 1, x: 0, duration: 0.6 },
        "-=0.3"
      )
      .fromTo(
        rememberRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        "-=0.2"
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.1"
      )
      .fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.3"
      )
      .fromTo(
        cardsRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8 },
        "-=0.6"
      );

    return () => {
      tl.kill();
    };
  }, [isReady]);

  return (
    <section
      ref={sectionRef}
      id="games"
      className="relative min-h-screen flex items-center pt-20 md:pt-24 overflow-hidden"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(204,255,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(204,255,0,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
          {/* Left — Text */}
          <div className="space-y-6 md:space-y-8">
            {/* Tagline */}
            <div ref={taglineRef} className="opacity-0">
              <span className="font-[family-name:var(--font-jetbrains)] text-xs text-text-dim tracking-widest uppercase">
                // YOUR JOURNEY. LOGGED.
              </span>
            </div>

            {/* Main heading */}
            <div className="space-y-1 md:space-y-2">
              <div ref={playRef} className="opacity-0">
                <h1 className="font-[family-name:var(--font-press-start)] text-4xl md:text-5xl lg:text-6xl text-text leading-none">
                  PLAY.
                </h1>
              </div>
              <div ref={logRef} className="opacity-0">
                <h1 className="font-[family-name:var(--font-press-start)] text-4xl md:text-5xl lg:text-6xl text-text leading-none">
                  LOG.
                </h1>
              </div>
              <div ref={rememberRef} className="opacity-0">
                <GlitchText
                  text="REMEMBER."
                  as="h1"
                  className="font-[family-name:var(--font-press-start)] text-4xl md:text-5xl lg:text-6xl text-lime glow-lime leading-none"
                  glowOnHover
                  periodicGlitch
                  glitchInterval={8000}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div ref={subtitleRef} className="opacity-0 max-w-md">
              <p className="font-[family-name:var(--font-jetbrains)] text-sm md:text-base text-text-dim leading-relaxed">
                GGlog is your gaming archive.{" "}
                <span className="text-text">Track every adventure.</span>{" "}
                Review every masterpiece.{" "}
                <span className="text-text">Remember every world.</span>
              </p>
            </div>

            {/* Buttons */}
            <div ref={buttonsRef} className="opacity-0 flex flex-wrap gap-3">
              <PixelButton variant="primary" size="md">
                ⬛ START LOGGING_
              </PixelButton>
              <PixelButton variant="secondary" size="md">
                &gt; EXPLORE GAMES
              </PixelButton>
            </div>
          </div>

          {/* Right — Game Cards */}
          <div ref={cardsRef} className="opacity-0 hidden lg:block">
            <GameCardStack />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}
