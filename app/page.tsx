"use client";

import { useState, useCallback } from "react";
import BootSequence from "@/components/BootSequence";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PopularReviewsSection from "@/components/sections/PopularReviewsSection";
import FooterCTASection from "@/components/sections/FooterCTASection";
import Footer from "@/components/Footer";

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
    // Small delay before revealing content for smooth transition
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <>
      {/* Boot sequence overlay */}
      {!bootComplete && <BootSequence onComplete={handleBootComplete} />}

      {/* Main site content */}
      <div
        className={`
          transition-opacity duration-500
          ${showContent ? "opacity-100" : "opacity-0"}
        `}
      >
        <Navbar />

        <main>
          {/* Hero */}
          <HeroSection isReady={showContent} />

          {/* Features */}
          <FeaturesSection />

          {/* Popular Reviews */}
          <PopularReviewsSection />

          {/* Footer CTA */}
          <FooterCTASection />
        </main>

        <Footer />
      </div>
    </>
  );
}
