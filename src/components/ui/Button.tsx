"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] select-none tracking-tight";

    const variants = {
      primary:   "btn-gradient text-white hover:shadow-[0_0_24px_rgba(255,107,44,0.25)] hover:brightness-110",
      secondary: "bg-[var(--bg-raised)] border border-[var(--border-strong)] text-[var(--text-1)] hover:bg-[var(--bg-overlay)]",
      ghost:     "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]",
      danger:    "bg-[rgba(239,68,68,0.06)] text-[#F87171] border border-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.1)]",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 h-8 gap-1.5",
      md: "text-sm px-5 py-2.5 h-10 gap-2",
      lg: "text-[15px] px-6 py-3 h-12 gap-2",
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
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";
