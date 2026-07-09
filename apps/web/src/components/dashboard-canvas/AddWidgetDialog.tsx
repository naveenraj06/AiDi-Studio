import type { Widget } from "@/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TYPE_ICON } from "@/components/widgets/widgetTypeMeta";

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableWidgets: Widget[];
  onCreateNew: () => void;
  onAdd: (widget: Widget) => void;
}

export function AddWidgetDialog({ open, onOpenChange, availableWidgets, onCreateNew, onAdd }: AddWidgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent widthClassName="flex max-h-[70vh] w-[460px] flex-col">
        <DialogTitle className="mb-1">Add widget</DialogTitle>
        <div className="mb-4 text-[12px] text-ink-3">Pick from the library, or create a new one.</div>

        <div
          onClick={onCreateNew}
          className="mb-3.5 flex cursor-pointer items-center gap-2.5 rounded-[9px] border border-dashed border-[#2e2e3a] bg-bg-2 p-3"
        >
          <span className="text-[16px]">✦</span>
          <span className="text-[13px] font-semibold">Create new widget in builder</span>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto">
          {availableWidgets.map((w) => (
            <div
              key={w.id}
              onClick={() => onAdd(w)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-bg-2 px-3 py-2.5 hover:bg-bg-3"
            >
              <span>{TYPE_ICON[w.type]}</span>
              <span className="flex-1 text-[13px]">{w.name}</span>
              <span className="text-[10px] capitalize text-ink-3">{w.type}</span>
            </div>
          ))}
          {availableWidgets.length === 0 && (
            <div className="py-2.5 text-[12px] text-ink-3">All library widgets are already on this dashboard.</div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
