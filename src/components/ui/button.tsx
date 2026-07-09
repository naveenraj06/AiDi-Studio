import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-brand-violet text-white hover:bg-brand-violet-dark cursor-pointer",
        ghost: "bg-transparent text-ink-2 hover:text-ink-1 cursor-pointer",
        success: "bg-brand-green text-brand-green-ink font-bold hover:brightness-95 cursor-pointer",
        outline: "bg-transparent border border-border-strong text-ink-1 hover:border-border-track cursor-pointer",
      },
      size: {
        default: "px-[22px] py-2.5",
        sm: "px-[18px] py-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
