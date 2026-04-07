"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[var(--accent-primary)] text-black hover:bg-[#28c240] shadow-lg shadow-[var(--accent-primary-glow)]",
      secondary:
        "glass-card-sm text-[var(--text-primary)] hover:bg-white/10 border border-white/20",
      ghost:
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5",
      danger:
        "bg-[#FF453A] text-white hover:bg-[#e53935]",
    };

    const sizes = {
      sm: "text-sm px-4 py-2 h-9",
      md: "text-sm px-6 py-3 h-11",
      lg: "text-base px-8 py-4 h-14",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
