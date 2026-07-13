import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { ApiResource, FieldMapping, WidgetCategory, WidgetFineTune, WidgetSuggestion, WidgetType } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useGetProjectQuery } from "@/store/api/projectsApi";
import { useGetResourcesQuery, useSuggestWidgetMutation } from "@/store/api/resourcesApi";
import { useCreateWidgetMutation, useGetWidgetsQuery, useUpdateWidgetMutation } from "@/store/api/widgetsApi";
import { getErrorMessage } from "@/lib/errors";
import { requiresResource } from "@/components/widgets/widgetTypeMeta";
import { suggestFor } from "@/components/widget-builder/suggestFor";
import { StepProgress } from "@/components/widget-builder/StepProgress";
import { Step1Resource } from "@/components/widget-builder/Step1Resource";
import { Step2Suggestion } from "@/components/widget-builder/Step2Suggestion";
import { Step3FineTune } from "@/components/widget-builder/Step3FineTune";
import { Step4Preview } from "@/components/widget-builder/Step4Preview";

const DEFAULT_FT: WidgetFineTune = {
  title: "New widget",
  color: "#8b5cf6",
  showLegend: true,
  showPoints: true,
  showTooltip: true,
  refreshInterval: 60,
};

export default function WidgetBuilderPage() {
  const { projectId, widgetId } = useParams<{ projectId: string; widgetId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useAuth();
  const isEditing = widgetId !== "new";

  const { data: project, isLoading: projectLoading } = useGetProjectQuery(projectId ?? "", { skip: !projectId });
  const { data: resources, isLoading: resourcesLoading } = useGetResourcesQuery(projectId ?? "", { skip: !projectId });
  const { data: widgets, isLoading: widgetsLoading } = useGetWidgetsQuery(projectId ?? "", { skip: !projectId });
  const [createWidget] = useCreateWidgetMutation();
  const [updateWidget] = useUpdateWidgetMutation();
  const [suggestWidget] = useSuggestWidgetMutation();

  const existingWidget = isEditing ? widgets?.find((w) => w.id === widgetId) : undefined;
  const widgetNotFound = isEditing && !widgetsLoading && !!widgets && !existingWidget;
  const fromTemplate = searchParams.get("fromTemplate") === "1";

  const [step, setStep] = React.useState(1);
  const [selectedResourceId, setSelectedResourceId] = React.useState<string | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<WidgetSuggestion | null>(null);
  const [mapping, setMapping] = React.useState<FieldMapping[]>([]);
  const [chosenTypeOverride, setChosenTypeOverride] = React.useState<WidgetType | null>(null);
  const [ft, setFt] = React.useState<WidgetFineTune>(DEFAULT_FT);
  const [saveAsTemplate, setSaveAsTemplate] = React.useState(false);
  const [category, setCategory] = React.useState<WidgetCategory | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [prefilled, setPrefilled] = React.useState(false);

  React.useEffect(() => {
    if (isEditing && existingWidget && !prefilled) {
      setSelectedResourceId(existingWidget.resource_id);
      setChosenTypeOverride(existingWidget.type);
      setMapping(existingWidget.mapping ?? []);
      setFt({
        ...DEFAULT_FT,
        ...(existingWidget.fine_tune ?? {}),
        title: existingWidget.fine_tune?.title || existingWidget.name,
      });
      setSaveAsTemplate(existingWidget.is_template);
      setCategory(existingWidget.category);
      // A duplicated-from-template widget lands here unbound — send the user
      // to resource selection instead of straight to fine-tune.
      const needsResource = requiresResource(existingWidget.type) && !existingWidget.resource_id && fromTemplate;
      setStep(needsResource ? 1 : 3);
      setPrefilled(true);
    }
  }, [isEditing, existingWidget, prefilled, fromTemplate]);

  if (!projectId) return null;

  const backToLibrary = () => navigate(`/projects/${projectId}/widgets`);

  const updateFt = (patch: Partial<WidgetFineTune>) => setFt((prev) => ({ ...prev, ...patch }));

  const runAnalysis = async (resourceId: string) => {
    setAnalyzing(true);
    try {
      const result = await suggestWidget({ projectId, id: resourceId }).unwrap();
      setSuggestion(result);
      setMapping(result.mapping);
    } catch {
      // Our own API is unreachable — fall back to the offline, name-keyword
      // heuristic so the builder still produces something usable.
      const resource = resources?.find((r) => r.id === resourceId);
      if (resource) {
        const result = suggestFor(resource);
        setSuggestion(result);
        setMapping(result.mapping);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const selectResource = (r: ApiResource) => {
    setSelectedResourceId(r.id);
    setFt((prev) => ({ ...prev, title: r.name.replace(/^(Stripe|API)\s*/, "") + " Widget" }));
  };

  const toStep2 = () => {
    if (!selectedResourceId) {
      toast("Pick a resource first", "error");
      return;
    }
    setStep(2);
    setChosenTypeOverride(null);
    void runAnalysis(selectedResourceId);
  };

  const skipToStep2 = () => {
    setSelectedResourceId(null);
    setSuggestion(null);
    setMapping([]);
    setStep(2);
  };

  const backToStep2 = () => {
    if (!suggestion && selectedResourceId) void runAnalysis(selectedResourceId);
    setStep(2);
  };

  const chosenType: WidgetType = chosenTypeOverride ?? suggestion?.suggestedType ?? "table";

  const saveWidget = async () => {
    setSaving(true);
    try {
      const input = {
        name: ft.title,
        type: chosenType,
        isTemplate: saveAsTemplate,
        category: saveAsTemplate ? (category ?? "generic") : null,
        resourceId: selectedResourceId,
        mapping,
        fineTune: ft,
      };
      if (isEditing && widgetId) {
        await updateWidget({ projectId, id: widgetId, input }).unwrap();
        toast("Widget updated", "success");
      } else {
        await createWidget({ projectId, input }).unwrap();
        toast("Widget saved", "success");
      }
      navigate(`/projects/${projectId}/widgets`);
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't save the widget — try again"), "error");
    } finally {
      setSaving(false);
    }
  };

  const headerTitle = isEditing ? "Edit widget" : "New widget";

  if (projectLoading || resourcesLoading || (isEditing && !widgetNotFound && !prefilled)) {
    return (
      <div className="max-w-[880px] px-11 pb-[60px] pt-8">
        <div className="h-6 w-40 animate-pulse rounded bg-bg-2" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-[880px] px-11 pb-[60px] pt-8">
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Project not found, or you don't have access to it.
        </div>
      </div>
    );
  }

  if (widgetNotFound) {
    return (
      <div className="max-w-[880px] px-11 pb-[60px] pt-8">
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Widget not found — it may have been deleted.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[880px] px-11 pb-[60px] pt-8">
      <div onClick={backToLibrary} className="mb-1 flex cursor-pointer items-center gap-2.5 text-[12px] text-ink-3">
        ← Widgets library
      </div>
      <div className="font-display mb-6 mt-2 text-[24px] font-bold text-ink-1">{headerTitle}</div>

      <StepProgress step={step} />

      {step === 1 && (
        <Step1Resource
          resources={resources ?? []}
          selectedResourceId={selectedResourceId}
          onSelect={selectResource}
          onNext={toStep2}
          onSkip={skipToStep2}
        />
      )}

      {step === 2 && (
        <Step2Suggestion
          hasResource={!!selectedResourceId}
          analyzing={analyzing}
          suggestion={suggestion}
          chosenType={chosenTypeOverride}
          onPickAlternative={setChosenTypeOverride}
          onBack={() => setStep(1)}
          onAccept={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3FineTune
          type={chosenType}
          ft={ft}
          resources={resources ?? []}
          mapping={mapping}
          onChange={updateFt}
          onBack={backToStep2}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <Step4Preview
          projectId={projectId}
          type={chosenType}
          resourceId={selectedResourceId}
          mapping={mapping}
          ft={ft}
          saveAsTemplate={saveAsTemplate}
          category={category}
          saving={saving}
          onToggleTemplate={() => setSaveAsTemplate((v) => !v)}
          onCategoryChange={setCategory}
          onBack={() => setStep(3)}
          onSave={saveWidget}
        />
      )}
    </div>
  );
}
