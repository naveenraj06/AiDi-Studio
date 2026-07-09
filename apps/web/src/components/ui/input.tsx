import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "mt-[5px] box-border w-full rounded-lg border border-border-strong bg-bg-0 px-3 py-2.5 text-[13px] text-ink-1 outline-none transition-colors",
        "focus-visible:border-brand-violet",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
