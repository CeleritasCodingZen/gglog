"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import PixelButton from "../ui/PixelButton";
import GlitchText from "../ui/GlitchText";

gsap.registerPlugin(ScrollTrigger);

export default function FooterCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      "-=0.3"
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 md:py-40 overflow-hidden"
    >
      {/* Background landscape */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/footer-landscape.png"
          alt="Pixel landscape"
          fill
          className="object-cover object-center opacity-30"
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />
      </div>

      {/* CRT scanline intensification */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-50"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        <div ref={textRef}>
          <h2 className="font-[family-name:var(--font-press-start)] text-2xl md:text-4xl lg:text-5xl text-text leading-relaxed">
            READY FOR
            <br />
            <GlitchText
              text="YOUR NEXT QUEST?"
              as="span"
              className="text-lime glow-lime-strong"
              periodicGlitch
              glitchInterval={10000}
            />
          </h2>

          <p className="font-[family-name:var(--font-jetbrains)] text-sm text-text-dim mt-6 max-w-lg mx-auto">
            Join thousands of archivists preserving their gaming legacy.
            Every playthrough matters.
          </p>
        </div>

        <div ref={buttonRef} className="mt-10">
          <PixelButton variant="primary" size="lg">
            CREATE ACCOUNT_
          </PixelButton>
        </div>
      </div>
    </section>
  );
}
