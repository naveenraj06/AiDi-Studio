import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPublished: boolean;
  publicUrl: string;
  embedSnippet: string;
  viewerFilters: boolean;
  branding: boolean;
  onToggleViewerFilters: () => void;
  onToggleBranding: () => void;
  onCopyUrl: () => void;
  onKeepDraft: () => void;
  onTogglePublishState: () => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  isPublished,
  publicUrl,
  embedSnippet,
  viewerFilters,
  branding,
  onToggleViewerFilters,
  onToggleBranding,
  onCopyUrl,
  onKeepDraft,
  onTogglePublishState,
}: PublishDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent widthClassName="w-[480px]">
        <DialogTitle className="mb-1.5">
          {isPublished ? "Manage publish state" : "Publish this dashboard"}
        </DialogTitle>
        <div className="mb-[18px] text-[12px] leading-[1.6] text-ink-2">
          {isPublished
            ? "This dashboard is public. Anyone with the URL can view it, and the embed snippet is live. Underlying API credentials are never exposed — all data calls are proxied server-side."
            : "Publishing makes this dashboard reachable at a public URL and unlocks the iframe/SDK embed. Underlying credentials stay protected — all data calls are proxied server-side."}
        </div>

        {isPublished && (
          <>
            <div className="mb-2.5 flex items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[12px] text-brand-cyan">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{publicUrl}</span>
              <span onClick={onCopyUrl} className="shrink-0 cursor-pointer text-brand-violet-light">
                Copy
              </span>
            </div>
            <div className="mb-4 whitespace-pre-wrap break-all rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[11px] text-ink-3">
              {embedSnippet}
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[13px] text-ink-1">Viewers can edit global filters</span>
              <Switch checked={viewerFilters} onCheckedChange={onToggleViewerFilters} />
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle py-2">
              <span className="text-[13px] text-ink-1">Show AiDi branding</span>
              <Switch checked={branding} onCheckedChange={onToggleBranding} />
            </div>
          </>
        )}

        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={onKeepDraft}>
            {isPublished ? "Close" : "Keep as draft"}
          </Button>
          <Button
            variant={isPublished ? "outline" : "primary"}
            onClick={onTogglePublishState}
            style={isPublished ? { background: "#2a1518", color: "var(--color-brand-red)", borderColor: "#2a1518" } : undefined}
          >
            {isPublished ? "Unpublish" : "Publish now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
