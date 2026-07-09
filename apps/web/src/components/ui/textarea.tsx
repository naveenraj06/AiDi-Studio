import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "mt-[5px] box-border w-full resize-none rounded-lg border border-border-strong bg-bg-0 px-3 py-2.5 font-mono text-[12px] text-ink-1 outline-none transition-colors",
        "focus-visible:border-brand-violet",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
