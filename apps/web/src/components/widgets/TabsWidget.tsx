import type { EmbeddedView } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

interface TabsWidgetProps {
  views: EmbeddedView[];
  projectId?: string | null;
}

export function TabsWidget({ views, projectId }: TabsWidgetProps) {
  if (views.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[11px] text-ink-3">Add tabs in the builder</div>
    );
  }

  return (
    <Tabs defaultValue="0" className="flex h-full flex-col gap-2">
      <TabsList>
        {views.map((v, i) => (
          <TabsTrigger key={i} value={String(i)}>
            {v.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {views.map((v, i) => (
        <TabsContent key={i} value={String(i)} className="min-h-0 flex-1">
          <WidgetRenderer type={v.type} projectId={projectId} resourceId={v.resourceId} mapping={v.mapping} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
