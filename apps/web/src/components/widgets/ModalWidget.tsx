import type { EmbeddedView } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

interface ModalWidgetProps {
  buttonLabel?: string;
  title?: string;
  view?: EmbeddedView;
  projectId?: string | null;
}

export function ModalWidget({ buttonLabel = "View details", title, view, projectId }: ModalWidgetProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      {title && <div className="text-[13px] font-semibold text-ink-1">{title}</div>}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            {buttonLabel}
          </Button>
        </DialogTrigger>
        <DialogContent widthClassName="w-[520px]">
          <DialogTitle>{title ?? buttonLabel}</DialogTitle>
          <div className="h-[320px]">
            {view ? (
              <WidgetRenderer type={view.type} projectId={projectId} resourceId={view.resourceId} mapping={view.mapping} />
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-ink-3">
                Nothing configured yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
