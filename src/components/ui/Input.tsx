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
          "w-full px-4 py-3 rounded-lg text-sm text-[var(--text-1)] bg-[var(--bg-raised)]",
          "outline-none placeholder-[var(--text-3)] transition-all duration-200",
          "focus:ring-2 focus:ring-[var(--accent)]",
          error && "ring-2 ring-[#F87171] focus:ring-[#F87171]",
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
