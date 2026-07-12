import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.03em]",
  {
    variants: {
      variant: {
        neutral: "bg-border-strong text-ink-2",
        success: "bg-brand-green-surface text-brand-green",
        warning: "bg-brand-amber/15 text-brand-amber",
        error: "bg-brand-red-surface text-brand-red",
        info: "bg-brand-cyan/15 text-brand-cyan",
        violet: "bg-brand-violet/15 text-brand-violet-light",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
));
Badge.displayName = "Badge";

export { Badge, badgeVariants };
