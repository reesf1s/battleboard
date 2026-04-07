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
      "inline-flex items-center justify-center font-medium tracking-tight rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] select-none";

    const variants = {
      primary:   "bg-[var(--accent)] text-black hover:brightness-110",
      secondary: "bg-[var(--bg-raised)] border border-[var(--border-strong)] text-[var(--text-1)] hover:bg-[var(--bg-overlay)]",
      ghost:     "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]",
      danger:    "bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/20 hover:bg-[#EF4444]/15",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-9 gap-2",
      lg: "text-sm px-5 py-2.5 h-11 gap-2",
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
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";
