"use client";

// ============================================
// GGLOG — Collection Cards
// ============================================

import type { Collection } from "@/data/mockCollections";

interface CollectionCardsProps {
  collections: Collection[];
}

export default function CollectionCards({ collections }: CollectionCardsProps) {
  return (
    <div className="profile-fade-5 mt-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-space text-[10px] text-text-muted tracking-[0.15em] uppercase">
          DATA_COLLECTIONS
        </span>
        <button className="font-space text-[9px] text-lime/60 hover:text-lime tracking-[0.1em] uppercase transition-colors">
          &gt; VIEW_ALL
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="space-y-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="bg-surface border border-border hover:border-border-active transition-colors duration-300 cursor-pointer group"
          >
            {/* Placeholder Image Grid */}
            <div className="collection-img-grid m-3 mb-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="collection-img-placeholder" />
              ))}
            </div>

            {/* Info */}
            <div className="px-3 py-3">
              <h4 className="font-pixel text-[9px] text-text tracking-wider group-hover:text-lime transition-colors">
                {collection.title}
              </h4>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-space text-[9px] text-text-muted tracking-wider">
                  {collection.gamesCount} ENTRIES
                </span>
                <span className="font-space text-[8px] text-text-muted/50 tracking-wider uppercase">
                  UPDATED: {collection.updatedAgo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
