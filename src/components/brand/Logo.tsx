import { cn } from "@/lib/utils";

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute rounded-[3px] bg-brand-violet"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          left: size * 0.18,
          top: size * 0.06,
          transform: "rotate(45deg)",
        }}
      />
      <div
        className="absolute rounded-[1px] bg-brand-cyan"
        style={{
          width: size * 0.32,
          height: size * 0.32,
          left: size * 0.58,
          top: size * 0.36,
          transform: "rotate(45deg)",
        }}
      />
    </div>
  );
}

export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className="font-bold text-ink-1" style={{ fontSize: size * 0.52 }}>
        AiDi Studio
      </span>
    </div>
  );
}
