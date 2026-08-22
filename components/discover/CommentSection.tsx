// ============================================
// GGLOG — Discover: CommentSection
// ============================================
// Expandable comment thread for a review.
// Loads comments on expand, supports create + delete.
// userId is always from the authenticated session.
// ============================================

"use client";

import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { CommentResponse } from "@/lib/types/review";
import type { PaginatedResponse } from "@/lib/types/social";

interface CommentSectionProps {
  reviewId: string;
  initialCommentCount: number;
  /** The current user's ID — used to show delete button */
  currentUserId: string;
  currentUsername: string;
}

type CommentsData = PaginatedResponse<CommentResponse>;

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CommentSection({
  reviewId,
  initialCommentCount,
  currentUserId,
  currentUsername,
}: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compose state
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load on expand
  useEffect(() => {
    if (!expanded || comments.length > 0) return;
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  async function loadComments() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<CommentsData>(
        `/api/reviews/${reviewId}/comments?limit=50`
      );
      setComments(data.items);
    } catch {
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const data = await apiPost<{ comment: CommentResponse }>(
        `/api/reviews/${reviewId}/comments`,
        { body: trimmed }
      );
      setComments((prev) => [...prev, data.comment]);
      setCommentCount((c) => c + 1);
      setBody("");
    } catch {
      // Silent fail — user can retry
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await apiDelete(`/api/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((c) => Math.max(0, c - 1));
    } catch {
      // Silent fail
    }
  }

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="font-mono text-[9px] text-text-muted tracking-wider hover:text-lime transition-colors duration-150"
      >
        COMMENTS {commentCount}{" "}
        <span className="text-text-muted/30">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="mt-3 border-t border-border pt-3 space-y-3">
          {/* Loading */}
          {loading && (
            <p className="font-mono text-[9px] text-text-muted/50 tracking-wider">
              LOADING_
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="font-mono text-[9px] text-warning/60 tracking-wider">
              {error}
            </p>
          )}

          {/* Empty */}
          {!loading && !error && comments.length === 0 && (
            <p className="font-mono text-[9px] text-text-muted/40 tracking-wider">
              NO COMMENTS ARCHIVED_
            </p>
          )}

          {/* Comment list */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group/comment">
              {/* Mini avatar */}
              <div className="w-5 h-5 bg-bg border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-[family-name:var(--font-press-start)] text-[5px] text-lime/40">
                  {comment.user.username.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Author + time */}
                <div className="flex items-center gap-2 mb-0.5">
                  <a
                    href={`/dashboard/profile/${comment.user.username}`}
                    className="font-[family-name:var(--font-press-start)] text-[7px] text-lime/70 hover:text-lime transition-colors tracking-wider"
                  >
                    {comment.user.username}
                  </a>
                  <span className="font-mono text-[8px] text-text-muted/30 tracking-wider">
                    {timeAgo(comment.createdAt)}
                  </span>
                  {/* Delete button — owner only */}
                  {comment.user.id === currentUserId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="font-mono text-[7px] text-text-muted/20 hover:text-warning/60 tracking-wider opacity-0 group-hover/comment:opacity-100 transition-opacity ml-auto"
                    >
                      [ DELETE ]
                    </button>
                  )}
                </div>

                {/* Body */}
                <p className="font-mono text-[10px] text-text-dim leading-relaxed tracking-wide">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}

          {/* Compose form */}
          <form
            onSubmit={handleSubmit}
            className="pt-2 border-t border-border/50"
          >
            <div className="flex items-start gap-2">
              {/* Tiny current user avatar */}
              <div className="w-5 h-5 bg-bg border border-lime/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="font-[family-name:var(--font-press-start)] text-[5px] text-lime/60">
                  {currentUsername.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="WRITE A COMMENT..."
                  maxLength={1000}
                  rows={2}
                  className="
                    w-full bg-surface border border-border
                    px-3 py-2 resize-none
                    font-mono text-[10px] text-text placeholder:text-text-muted/30
                    tracking-wider placeholder:tracking-wider
                    focus:outline-none focus:border-lime/40
                    transition-colors duration-150
                  "
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-mono text-[8px] text-text-muted/30 tracking-wider">
                    {body.length}/1000
                  </span>
                  <button
                    type="submit"
                    disabled={!body.trim() || submitting}
                    className="
                      font-[family-name:var(--font-press-start)] text-[7px] tracking-wider
                      border border-border text-text-muted
                      px-3 py-1.5
                      hover:border-lime/40 hover:text-lime
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-all duration-150
                      btn-press
                    "
                  >
                    {submitting ? "..." : "[ POST ]"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
