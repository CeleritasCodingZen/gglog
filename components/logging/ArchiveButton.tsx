"use client";

// ============================================
// GGLOG — Archive Button (Logging Page)
// ============================================
// Animated submit button with 3-phase simulation:
// ARCHIVING → SYNCING → COMPLETE. No API call.
// ============================================

import { useState, useCallback } from "react";

interface ArchiveButtonProps {
  onArchive: () => Promise<void>;
  onSaveDraft: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

type ArchivePhase = "idle" | "archiving" | "syncing" | "complete";

export default function ArchiveButton({
  onArchive,
  onSaveDraft,
  onCancel,
  disabled = false,
}: ArchiveButtonProps) {
  const [phase, setPhase] = useState<ArchivePhase>("idle");

  const handleArchive = useCallback(async () => {
    if (phase !== "idle" || disabled) return;

    setPhase("archiving");
    await new Promise((r) => setTimeout(r, 1000));

    setPhase("syncing");
    await new Promise((r) => setTimeout(r, 800));

    setPhase("complete");
    await onArchive();
  }, [phase, disabled, onArchive]);

  const getButtonContent = () => {
    switch (phase) {
      case "archiving":
        return (
          <span className="flex items-center gap-2">
            <span className="archive-spinner" />
            ARCHIVING...
          </span>
        );
      case "syncing":
        return (
          <span className="flex items-center gap-2">
            <span className="archive-spinner" />
            SYNCING...
          </span>
        );
      case "complete":
        return (
          <span className="flex items-center gap-2">
            <span className="text-bg">✓</span>
            ENTRY ARCHIVED
          </span>
        );
      default:
        return "ARCHIVE ENTRY";
    }
  };

  const isProcessing = phase !== "idle" && phase !== "complete";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Primary CTA */}
      <button
        onClick={handleArchive}
        disabled={disabled || isProcessing || phase === "complete"}
        className={`
          flex-1 sm:flex-none
          font-pixel text-[10px] tracking-wider
          border px-6 py-3.5
          transition-all duration-300
          btn-press
          flex items-center justify-center gap-2
          ${phase === "complete"
            ? "bg-lime text-bg border-lime"
            : phase === "idle"
              ? disabled
                ? "bg-surface text-text-muted border-border cursor-not-allowed"
                : "bg-lime text-bg border-lime hover:bg-transparent hover:text-lime glow-lime-box"
              : "bg-lime/20 text-lime border-lime/50 cursor-wait"
          }
        `}
      >
        {getButtonContent()}
      </button>

      {/* Secondary Actions */}
      {phase === "idle" && (
        <>
          <button
            onClick={onSaveDraft}
            className="
              font-pixel text-[8px] tracking-wider
              text-text-dim border border-border
              hover:border-border-active hover:text-text
              px-4 py-2.5
              transition-all duration-200
              flex items-center justify-center gap-1.5
            "
          >
            💾 SAVE DRAFT
          </button>
          <button
            onClick={onCancel}
            className="
              font-pixel text-[8px] tracking-wider
              text-text-muted border border-transparent
              hover:text-warning hover:border-warning/30
              px-4 py-2.5
              transition-all duration-200
              flex items-center justify-center
            "
          >
            CANCEL
          </button>
        </>
      )}
    </div>
  );
}
