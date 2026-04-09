"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl text-sm text-[var(--text-1)] bg-[var(--bg-raised)]",
          "border border-[var(--border)] outline-none placeholder-[var(--text-3)]",
          "focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(255,107,44,0.08)] transition-all duration-200",
          error && "border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#F87171] font-medium">{error}</span>}
      {hint && !error && <span className="text-xs text-[var(--text-3)]">{hint}</span>}
    </div>
  )
);
Input.displayName = "Input";
