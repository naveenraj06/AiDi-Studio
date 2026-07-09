import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  bg?: string;
  color?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, style, bg, color, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.03em]",
        className,
      )}
      style={{ background: bg, color, ...style }}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge };
