import React, { useState } from "react";
import { Code2, Clipboard, Check, HelpCircle, Eye, Shield, Laptop, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const mockDonutData = [
  { name: "Direct", value: 420, color: "#3b82f6" },
  { name: "Email", value: 260, color: "#0ea5e9" },
  { name: "Social", value: 180, color: "#10b981" },
];

export default function EmbedView() {
  const [activeTab, setActiveTab] = useState<"embed" | "sdk" | "api">("embed");
  const [selectedDashboard, setSelectedDashboard] = useState("executive-overview");
  const [selectedVisibility, setSelectedVisibility] = useState("Public");
  const [embedFormat, setEmbedFormat] = useState("HTML");
  const [copied, setCopied] = useState(false);

  const getEmbedCode = () => {
    if (embedFormat === "HTML") {
      return `<iframe\n  src="https://app.aidistudio.com/embed/d/${selectedDashboard}?visibility=${selectedVisibility.toLowerCase()}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  allowfullscreen\n></iframe>`;
    } else {
      return `import { AiDiClient } from "@aidi/sdk";\n\nconst aidi = new AiDiClient({\n  token: "aidi_live_72k39x9b4s84s"\n});\n\naidi.embed("#analytics-container", {\n  dashboardId: "${selectedDashboard}",\n  theme: "dark",\n  interactive: true\n});`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Code2 className="w-5.5 h-5.5 text-[#3b82f6]" />
          Embed & SDK Code Builder
        </h2>
        <p className="text-sm text-[#71717a] mt-1">
          Distribute and embed your compiled analytical dashboards directly inside client portals or mobile applications using standard HTML or developer SDKs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272a]">
        {[
          { id: "embed", label: "Embed Code" },
          { id: "sdk", label: "Developer SDK" },
          { id: "api", label: "API Reference" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-semibold text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeTab === tab.id
                ? "border-[#3b82f6] text-[#3b82f6]"
                : "border-transparent text-[#71717a] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Embed Code Configurator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white">Embed Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Select Dashboard
                </label>
                <select
                  value={selectedDashboard}
                  onChange={(e) => setSelectedDashboard(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                >
                  <option value="executive-overview">Executive Overview</option>
                  <option value="marketing-overview">Marketing Overview</option>
                  <option value="sales-performance">Sales Performance</option>
                  <option value="customer-insights">Customer Insights</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Visibility Mode
                </label>
                <select
                  value={selectedVisibility}
                  onChange={(e) => setSelectedVisibility(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                >
                  <option value="Public">Public Access</option>
                  <option value="Private">Authenticated Token</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Embed Code block</span>
                <div className="flex bg-[#18181b] border border-[#27272a] rounded p-0.5">
                  <button
                    onClick={() => setEmbedFormat("HTML")}
                    className={`px-2 py-1 rounded text-[10px] font-semibold ${embedFormat === "HTML" ? "bg-[#3b82f6] text-white" : "text-[#71717a] hover:text-white"}`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setEmbedFormat("SDK")}
                    className={`px-2 py-1 rounded text-[10px] font-semibold ${embedFormat === "SDK" ? "bg-[#3b82f6] text-white" : "text-[#71717a] hover:text-white"}`}
                  >
                    SDK
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 font-mono text-[11px] text-blue-300 overflow-x-auto min-h-32">
                  {getEmbedCode()}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute right-3.5 top-3.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#27272a] rounded p-1.5 transition-colors cursor-pointer"
                  title="Copy code to clipboard"
                  id="copy-embed-code-btn"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-[#71717a] leading-relaxed bg-[#18181b]/50 border border-[#27272a] p-4 rounded-lg flex gap-3">
              <Shield className="w-5 h-5 text-[#3b82f6] shrink-0" />
              <div>
                <span className="font-bold text-zinc-200 block mb-0.5">Strict Domain Security</span>
                Authorized embedding is restricted to whitelist domains configured in workspace settings. Unauthorized rendering on external frames will trigger firewall blocks.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Embed Mockup Preview */}
        <div className="lg:col-span-6 space-y-4">
          <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider block">
            LIVE EMBED PREVIEW MOCKUP
          </span>

          <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl relative">
            {/* Embedded mockup header */}
            <div className="bg-[#18181b] px-5 py-3 border-b border-[#27272a] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#71717a]" />
                <span className="text-[10px] font-mono text-[#71717a] font-semibold tracking-wider">PREVIEW CONTAINER</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/15 text-[#3b82f6] rounded font-mono font-bold uppercase">
                EMBED_IFRAME_OK
              </span>
            </div>

            {/* Simulated Customer App */}
            <div className="p-6 bg-[#09090b] space-y-6">
              {/* Stat Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest block">Revenue Stream</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">$98,346</div>
                  <span className="text-[9px] text-teal-400 mt-0.5 block font-semibold">↑ 12.4% vs last period</span>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest block">Active Users</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">12,438</div>
                  <span className="text-[9px] text-teal-400 mt-0.5 block font-semibold">↑ 8.2% vs yesterday</span>
                </div>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Users bar */}
                <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider block mb-3">User Growth</span>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[ { name: "1", val: 30 }, { name: "2", val: 45 }, { name: "3", val: 60 }, { name: "4", val: 80 } ]}>
                        <Bar dataKey="val" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        <XAxis dataKey="name" fontSize={8} stroke="#71717a" tickLine={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut slice */}
                <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider block mb-3">Top Inflows</span>
                  <div className="h-28 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={mockDonutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={18} outerRadius={30}>
                          {mockDonutData.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
