// ============================================
// GGLOG — Discover: SystemNote
// ============================================
// Decorative system flavour text panel.
// ============================================

"use client";

export default function SystemNote() {
  return (
    <div className="border border-warning/20 bg-warning/5 p-4 relative overflow-hidden">
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-warning/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-warning/30" />

      {/* Header */}
      <p className="font-[family-name:var(--font-press-start)] text-[7px] text-warning/60 tracking-wider mb-3">
        SYSTEM NOTE_
      </p>

      {/* Body */}
      <p className="font-mono text-[10px] text-text-muted leading-relaxed tracking-wide">
        THE ARCHIVE IS CURRENTLY INGESTING
        <br />
        NEW ENTRIES.
      </p>
      <p className="font-mono text-[10px] text-text-muted/60 mt-1.5 tracking-wide">
        EXPECT MINOR SECTOR DELAYS.
      </p>
    </div>
  );
}
