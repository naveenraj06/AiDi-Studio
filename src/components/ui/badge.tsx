import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-brand-violet/12 text-brand-violetLight",
        cyan: "bg-brand-cyan/12 text-brand-cyan",
        green: "bg-brand-green/12 text-brand-green",
        amber: "bg-brand-amber/12 text-brand-amber",
        red: "bg-brand-red/12 text-brand-red",
        neutral: "bg-white/[0.06] text-ink-2 border border-border-strong",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
