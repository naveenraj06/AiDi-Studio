import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiResources } from "@/data/apiResources";
import { sampleRawApiResponse } from "@/data/widgets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowLeft, Sparkles, Check, ChevronRight } from "lucide-react";

const steps = ["Pick API resource", "AI suggestion", "Fine-tune", "Preview & save"];

const alternatives = ["Bar chart", "Area chart", "Table"];

const mappings = [
  { from: "date", to: "X axis", type: "date" },
  { from: "revenue", to: "Y axis", type: "number" },
  { from: "region", to: "Series (optional)", type: "string" },
];

const previewData = [
  { m: "Jan", revenue: 21000 }, { m: "Feb", revenue: 28000 }, { m: "Mar", revenue: 32000 },
  { m: "Apr", revenue: 29000 }, { m: "May", revenue: 36000 }, { m: "Jun", revenue: 40000 }, { m: "Jul", revenue: 38900 },
];

export default function WidgetBuilder() {
  const { projectId = "marketing-analytics" } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(apiResources[0].id);
  const selectedResource = apiResources.find((r) => r.id === selectedResourceId)!;

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex min-h-screen flex-col bg-bg-0">
      <div className="flex h-13 items-center gap-3 border-b border-border bg-bg-1 px-4 py-2.5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-ink-2 hover:text-ink-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Cancel
        </button>
        <span className="text-sm font-semibold text-ink-1">Create Widget</span>
        <Button size="sm" className="ml-auto" disabled={step < steps.length - 1} onClick={() => navigate(`/app/projects/${projectId}/widgets`)}>
          Save to library
        </Button>
      </div>

      <div className="flex items-center gap-1 border-b border-border bg-bg-0 px-6 py-3">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs transition-colors ${
              i === step ? "border border-brand-violet/40 bg-brand-violet/15 text-brand-violetLight font-medium" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold ${i === step ? "bg-brand-violet text-white" : i < step ? "bg-brand-green text-bg-0" : "bg-bg-3 text-ink-3"}`}>
              {i < step ? <Check className="h-2.5 w-2.5" /> : i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6">
        {step === 0 && (
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-1 text-sm font-semibold text-ink-1">Pick an API resource from your library</h2>
            <p className="mb-5 text-xs text-ink-3">Choose a connected resource — no need to re-enter auth or endpoints.</p>
            <div className="space-y-2">
              {apiResources.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResourceId(r.id)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3.5 text-left transition-colors ${
                    selectedResourceId === r.id ? "border-brand-violet/50 bg-brand-violet/8" : "border-border bg-bg-1 hover:border-border-strong"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-ink-1">{r.name}</div>
                    <div className="mt-0.5 text-[11px] text-ink-3">{r.url} &middot; {r.method} &middot; {r.authType}</div>
                  </div>
                  <Badge variant={r.status === "healthy" ? "green" : "red"}>
                    {r.status === "healthy" ? "● Healthy" : "● Auth error"}
                  </Badge>
                </button>
              ))}
            </div>
            <Button className="mt-6" onClick={goNext}>
              Analyze with AI <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-bg-1 p-5">
              <div className="mb-3 text-[10px] font-medium uppercase tracking-wide text-ink-3">API resource (from library)</div>
              <div className="mb-5 flex items-center justify-between rounded-md border border-border bg-bg-2 p-3">
                <div>
                  <div className="text-sm font-medium text-ink-1">{selectedResource.name}</div>
                  <div className="text-[11px] text-ink-3">{selectedResource.url} &middot; {selectedResource.method} &middot; {selectedResource.authType}</div>
                </div>
                <Badge variant="green">● Healthy</Badge>
              </div>

              <div className="rounded-lg border-[1.5px] border-brand-violet/35 bg-brand-violet/6 p-4">
                <div className="flex items-center gap-1.5 text-sm font-bold text-brand-violetLight">
                  <Sparkles className="h-4 w-4" /> AI suggestion
                </div>
                <p className="mt-1 text-[11px] text-ink-2">Analyzed 30 records &middot; 4 fields &middot; time-series pattern detected</p>

                <div className="mt-4 text-[10px] font-medium uppercase tracking-wide text-ink-3">Suggested component</div>
                <div className="mt-2 flex items-center justify-between rounded-md border border-brand-violet/50 bg-brand-violet/15 p-3">
                  <div>
                    <div className="text-sm font-medium text-ink-1">📈 Line chart</div>
                    <div className="text-[10px] text-ink-2">date field + numeric trend → best fit</div>
                  </div>
                  <Badge>96% confident</Badge>
                </div>
                <div className="mt-2 flex gap-2">
                  {alternatives.map((a) => (
                    <button key={a} className="rounded-md border border-border-strong px-2.5 py-1.5 text-[10px] text-ink-2 hover:text-ink-1">{a}</button>
                  ))}
                </div>

                <div className="mt-4 text-[10px] font-medium uppercase tracking-wide text-ink-3">AI schema mapping</div>
                <div className="mt-2 space-y-1.5">
                  {mappings.map((m) => (
                    <div key={m.from} className="flex items-center gap-2 text-[11px]">
                      <Badge variant="cyan">{m.from}</Badge>
                      <span className="text-ink-3">→</span>
                      <Badge>{m.to}</Badge>
                      <span className="ml-auto text-ink-3">Edit</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button className="flex-1" onClick={goNext}>
                  <Check className="h-4 w-4" /> Accept suggestion
                </Button>
                <Button variant="secondary" onClick={goNext}>Adjust manually</Button>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-bg-2 p-3">
                <div>
                  <div className="text-xs font-medium text-ink-1">Also save as template</div>
                  <div className="text-[10px] text-ink-3">Reusable across dashboards and future projects</div>
                </div>
                <Switch checked={saveAsTemplate} onCheckedChange={setSaveAsTemplate} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-bg-1 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-1">Live preview</span>
                <Badge variant="cyan">Sample data · 30 records</Badge>
              </div>
              <div className="rounded-md border border-border bg-bg-2 p-3">
                <div className="mb-1 text-xs font-medium text-ink-2">Sales Over Time</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={previewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#6B6B76" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#6B6B76" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1C1C23", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#7D5AFF" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-md border border-border bg-bg-2 p-3">
                <div className="mb-2 text-xs font-medium text-ink-2">Raw sample (what AI analyzed)</div>
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="text-brand-cyan">
                      <th className="pb-1.5 font-medium">date</th>
                      <th className="pb-1.5 font-medium">revenue</th>
                      <th className="pb-1.5 font-medium">orders</th>
                      <th className="pb-1.5 font-medium">region</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRawApiResponse.map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-white/[0.02]" : ""}>
                        <td className="py-1 text-ink-2">{row.date}</td>
                        <td className="py-1 text-ink-2">{row.revenue}</td>
                        <td className="py-1 text-ink-2">{row.orders}</td>
                        <td className="py-1 text-ink-2">{row.region}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-1 text-sm font-semibold text-ink-1">Fine-tune your widget</h2>
            <p className="mb-5 text-xs text-ink-3">Adjust the title, color, and display options.</p>
            <div className="space-y-4 rounded-lg border border-border bg-bg-1 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-2">Widget title</label>
                <input defaultValue="Sales Over Time" className="w-full rounded-md border border-border-strong bg-bg-3 px-3 py-2 text-sm text-ink-1 outline-none focus:border-brand-violet" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-ink-2">Color theme</label>
                <div className="flex gap-2">
                  {["#7D5AFF", "#33D1EE", "#20D491", "#FEBF33"].map((c, i) => (
                    <button key={c} className={`h-7 w-7 rounded-full ${i === 0 ? "ring-2 ring-offset-2 ring-offset-bg-1 ring-ink-1" : ""}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-2">Show legend</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-2">Show data points</span>
                <Switch />
              </div>
            </div>
            <Button className="mt-6" onClick={goNext}>Continue to preview <ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15">
              <Check className="h-7 w-7 text-brand-green" />
            </div>
            <h2 className="text-lg font-bold text-ink-1">Widget ready to save</h2>
            <p className="mt-1 text-sm text-ink-2">
              "Sales Over Time" will be added to your widget library{saveAsTemplate ? " and saved as a template" : ""}.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-bg-1 p-5 text-left">
              <div className="mb-1 text-xs font-medium text-ink-2">Sales Over Time</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={previewData}>
                  <Line type="monotone" dataKey="revenue" stroke="#7D5AFF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Button className="mt-6" size="lg" onClick={() => navigate(`/app/projects/${projectId}/widgets`)}>
              Save to library
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
