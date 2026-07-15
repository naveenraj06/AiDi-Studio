import type * as React from "react";
import { Link } from "react-router-dom";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

/** Shared chrome for the Privacy Policy and Terms of Service pages — both documents share
 * the same eyebrow/title/updated-date/notice layout, just with different body sections. */
export function LegalDoc({
  eyebrow,
  title,
  updated,
  notice,
  crossLink,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  notice: React.ReactNode;
  crossLink: { label: string; to: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-0 text-ink-1">
      <MarketingHeader />

      <div className="mx-auto max-w-[820px] px-6 pb-[110px] pt-[56px]">
        <article className="rounded-2xl border border-border-default bg-bg-1 p-8 shadow-md sm:p-12">
          <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-violet-light">
            {eyebrow}
          </div>
          <h1 className="font-display mt-2 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[40px]">
            {title}
          </h1>
          <div className="mt-2 font-mono text-[13px] text-ink-3">Last updated: {updated}</div>

          <div className="mt-8 rounded-lg border border-dashed border-border-strong border-l-[3px] border-l-brand-violet bg-brand-violet/5 px-[18px] py-3.5 text-[13.5px] leading-[1.6] text-ink-2">
            {notice}
          </div>

          <div className="legal-doc mt-6">{children}</div>
        </article>

        <div className="mt-8 text-center font-mono text-[13px] text-ink-3">
          <Link to={crossLink.to} className="text-ink-3 hover:text-ink-2">
            {crossLink.label}
          </Link>
          <span className="mx-2">·</span>
          AiDi Studio
        </div>
      </div>
    </div>
  );
}
