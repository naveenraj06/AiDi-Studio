import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ApiResource, WidgetFineTune, WidgetSuggestion, WidgetType } from "@/types";
import { useApp } from "@/context/AppContext";
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
  refreshInterval: 60,
};

export default function WidgetBuilderPage() {
  const { projectId, widgetId } = useParams<{ projectId: string; widgetId: string }>();
  const navigate = useNavigate();
  const { projects, resourcesByProject, actions, toast } = useApp();

  const project = projects.find((p) => p.id === projectId);
  const resources = (projectId && resourcesByProject[projectId]) || [];

  const [step, setStep] = React.useState(1);
  const [selectedResourceId, setSelectedResourceId] = React.useState<string | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<WidgetSuggestion | null>(null);
  const [chosenTypeOverride, setChosenTypeOverride] = React.useState<WidgetType | null>(null);
  const [ft, setFt] = React.useState<WidgetFineTune>(DEFAULT_FT);
  const [saveAsTemplate, setSaveAsTemplate] = React.useState(false);

  if (!project || !projectId) return null;

  const backToLibrary = () => navigate(`/projects/${project.id}/widgets`);

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
    setAnalyzing(true);
    const resource = resources.find((r) => r.id === selectedResourceId);
    setTimeout(() => {
      if (resource) setSuggestion(suggestFor(resource));
      setAnalyzing(false);
      setChosenTypeOverride(null);
    }, 900);
  };

  const chosenType = chosenTypeOverride ?? suggestion?.suggestedType ?? "table";

  const saveWidget = () => {
    const resource = resources.find((r) => r.id === selectedResourceId);
    const id = "w" + Math.random().toString(36).slice(2, 8);
    actions.setWidgets(projectId, (list) => [
      ...list,
      {
        id,
        name: ft.title,
        type: chosenType,
        is_template: saveAsTemplate,
        resource: resource?.name ?? "",
        updated_at: new Date().toISOString(),
      },
    ]);
    toast("Widget saved", "success");
    navigate(`/projects/${project.id}/widgets`);
  };

  const headerTitle = widgetId === "new" ? "New widget" : "Edit widget";

  return (
    <div className="max-w-[880px] px-11 pb-[60px] pt-8">
      <div
        onClick={backToLibrary}
        className="mb-1 flex cursor-pointer items-center gap-2.5 text-[12px] text-ink-3"
      >
        ← Widgets library
      </div>
      <div className="font-display mb-6 mt-2 text-[24px] font-bold text-ink-1">{headerTitle}</div>

      <StepProgress step={step} />

      {step === 1 && (
        <Step1Resource
          resources={resources}
          selectedResourceId={selectedResourceId}
          onSelect={selectResource}
          onNext={toStep2}
        />
      )}

      {step === 2 && (
        <Step2Suggestion
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
          ft={ft}
          onTitleChange={(title) => setFt((prev) => ({ ...prev, title }))}
          onColorChange={(color) => setFt((prev) => ({ ...prev, color }))}
          onToggleLegend={() => setFt((prev) => ({ ...prev, showLegend: !prev.showLegend }))}
          onTogglePoints={() => setFt((prev) => ({ ...prev, showPoints: !prev.showPoints }))}
          onRefreshChange={(refreshInterval) => setFt((prev) => ({ ...prev, refreshInterval }))}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <Step4Preview
          ft={ft}
          chosenType={chosenType}
          saveAsTemplate={saveAsTemplate}
          onToggleTemplate={() => setSaveAsTemplate((v) => !v)}
          onBack={() => setStep(3)}
          onSave={saveWidget}
        />
      )}
    </div>
  );
}
