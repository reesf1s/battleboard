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
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-2)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-1)] bg-[var(--bg-raised)]",
          "border border-[var(--border)] outline-none placeholder-[var(--text-3)]",
          "focus:border-[var(--accent)] transition-colors duration-150",
          error && "border-[#EF4444] focus:border-[#EF4444]",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#F87171]">{error}</span>}
      {hint && !error && <span className="text-xs text-[var(--text-3)]">{hint}</span>}
    </div>
  )
);
Input.displayName = "Input";
