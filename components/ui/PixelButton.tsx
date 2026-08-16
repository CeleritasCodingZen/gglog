"use client";

import { ReactNode } from "react";

interface PixelButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
}

export default function PixelButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  href,
}: PixelButtonProps) {
  const baseClasses = `
    relative inline-flex items-center gap-2
    font-[family-name:var(--font-press-start)]
    tracking-wider uppercase
    border transition-all duration-200
    btn-press cursor-pointer select-none
    group
  `;

  const sizeClasses = {
    sm: "text-[8px] px-4 py-2",
    md: "text-[10px] px-6 py-3",
    lg: "text-[12px] px-8 py-4",
  };

  const variantClasses = {
    primary: `
      bg-lime text-bg border-lime
      hover:bg-transparent hover:text-lime hover:glow-lime-box
      active:bg-lime/20
    `,
    secondary: `
      bg-transparent text-text border-border
      hover:border-lime hover:text-lime hover:glow-lime-box
      active:bg-lime/5
    `,
    ghost: `
      bg-transparent text-text-dim border-transparent
      hover:text-lime hover:border-border
      active:bg-surface
    `,
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {/* Hover glow line */}
        <span className="absolute inset-x-0 -bottom-px h-px bg-lime opacity-0 group-hover:opacity-50 transition-opacity" />
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      <span className="absolute inset-x-0 -bottom-px h-px bg-lime opacity-0 group-hover:opacity-50 transition-opacity" />
      {children}
    </button>
  );
}
