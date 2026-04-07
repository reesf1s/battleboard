"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)]",
            "bg-white/6 border border-white/12 outline-none",
            "focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]",
            "transition-colors duration-200 text-sm",
            error && "border-[#FF453A] focus:border-[#FF453A] focus:ring-[#FF453A]",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-[#FF453A]">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
