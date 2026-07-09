import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Workflow,
  Sparkles,
  Play,
  CheckCircle,
  Clock,
  Zap,
  FileCode,
  Check,
  AlertTriangle,
  History,
  FileJson,
  Database
} from "lucide-react";
import { SchemaMappingHistory } from "../types";

// Standard starting source schema sample
const DEFAULT_SOURCE_SCHEMA = {
  user_id: "usr_94a3b8",
  fullname: "Alex Morgan",
  user_role_type: "Admin",
  price_usd: 1250.00,
  signup_timestamp: "2026-07-08T06:02:59Z",
  extra_metadata: {
    browser_agent: "Chrome",
    geo_country: "United States",
    referrer_channel: "Direct"
  }
};

// Target schema structure standard
const DEFAULT_TARGET_SCHEMA = {
  id: "string (Mapped from user_id)",
  displayName: "string (Mapped from fullname)",
  amount: "number (Mapped from price_usd)",
  timestamp: "string (Mapped from signup_timestamp in standard format)",
  region: "string (Extracted from extra_metadata.geo_country)"
};

export default function SchemaConverterView() {
  const [sourceDataStr, setSourceDataStr] = useState(JSON.stringify(DEFAULT_SOURCE_SCHEMA, null, 2));
  const [targetDataStr, setTargetDataStr] = useState(JSON.stringify(DEFAULT_TARGET_SCHEMA, null, 2));
  const [notes, setNotes] = useState("Map all fields into a flat, standardized format suitable for dashboard widgets. Parse dates.");
  
  // Suggested fields from Gemini
  const [mappingExplanation, setMappingExplanation] = useState<string>("Click 'Ask Gemini to Generate Mapper' or edit the mapping code below directly.");
  const [mapperCode, setMapperCode] = useState<string>(`(source) => {
  return {
    id: source.user_id || "N/A",
    displayName: source.fullname || "Anonymous",
    amount: typeof source.price_usd === "number" ? source.price_usd : 0,
    timestamp: source.signup_timestamp ? new Date(source.signup_timestamp).toISOString() : new Date().toISOString(),
    region: source.extra_metadata?.geo_country || "Unknown"
  };
}`);

  // Data processing state
  const [datasetSize, setDatasetSize] = useState<number>(50000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(null);
  const [convertedSamples, setConvertedSamples] = useState<{ source: any; target: any }[]>([]);
  const [history, setHistory] = useState<SchemaMappingHistory[]>([
    {
      id: "run-1",
      timestamp: "10 mins ago",
      sourceRows: 10000,
      targetRows: 10000,
      durationMs: 82,
      status: "success",
      throughput: 121951
    }
  ]);

  // Use React Query Mutation to get suggested mappings from backend Express API
  const mappingMutation = useMutation({
    mutationFn: async () => {
      let parsedSource = DEFAULT_SOURCE_SCHEMA;
      try {
        parsedSource = JSON.parse(sourceDataStr);
      } catch (e) {
        alert("Invalid Source JSON format. Please correct it.");
        throw e;
      }

      const response = await fetch("/api/schema/suggest-mapper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceSchema: parsedSource,
          targetSchema: targetDataStr,
          notes: notes
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggest mapping schema");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.mappingExplanation) {
        setMappingExplanation(data.mappingExplanation);
      }
      if (data.mapperCode) {
        setMapperCode(data.mapperCode);
      }
    },
    onError: (err: any) => {
      console.error("Mapping mutation error:", err);
      setMappingExplanation("Error communicating with AI Service. Used default converter fallback.");
    }
  });

  // Execute high speed Web Worker schema conversion
  const executeDataPipeline = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessedRows(0);
    setProcessingTimeMs(null);

    // Parse the current source sample as template to build our massive dataset
    let sourceTemplate: any;
    try {
      sourceTemplate = JSON.parse(sourceDataStr);
    } catch (e) {
      sourceTemplate = DEFAULT_SOURCE_SCHEMA;
    }

    // Generate huge mock dataset of size 'datasetSize' in blocks
    const names = ["Alex Morgan", "Sarah Jenkins", "Michael Chang", "Emma Watson", "David Miller", "Sofia Rossi"];
    const countries = ["United States", "Germany", "United Kingdom", "Japan", "France", "Canada", "Australia"];
    const channels = ["Direct", "Email", "Social", "Referral", "Organic Search"];

    const hugeDataset: any[] = [];
    for (let i = 0; i < datasetSize; i++) {
      hugeDataset.push({
        ...sourceTemplate,
        user_id: `usr_${Math.random().toString(36).substr(2, 6)}`,
        fullname: names[i % names.length],
        price_usd: Math.floor(Math.random() * 5000) + 50,
        signup_timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        extra_metadata: {
          browser_agent: i % 2 === 0 ? "Chrome" : "Safari",
          geo_country: countries[i % countries.length],
          referrer_channel: channels[i % channels.length]
        }
      });
    }

    // Inline Web Worker Code
    const workerCode = `
      self.onmessage = function(e) {
        const { dataset, mapperCodeString } = e.data;
        
        try {
          // Recreate the function from the string
          const mapperFn = new Function("return " + mapperCodeString)();
          const results = [];
          const total = dataset.length;
          
          const startTime = performance.now();
          
          for (let i = 0; i < total; i++) {
            const sourceItem = dataset[i];
            const targetItem = mapperFn(sourceItem);
            results.push(targetItem);
            
            // Post progress report back every 10%
            if (i % Math.max(1, Math.floor(total / 10)) === 0 || i === total - 1) {
              const percent = Math.round(((i + 1) / total) * 100);
              self.postMessage({
                type: 'progress',
                percent: percent,
                processed: i + 1
              });
            }
          }
          
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          self.postMessage({
            type: 'complete',
            results: results.slice(0, 5), // return only top 5 samples to keep messaging cheap
            totalRows: total,
            durationMs: duration
          });
          
        } catch (err) {
          self.postMessage({
            type: 'error',
            error: err.message
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    // Send the huge dataset and mapping code to our worker
    worker.postMessage({
      dataset: hugeDataset,
      mapperCodeString: mapperCode
    });

    worker.onmessage = (e) => {
      const { type, percent, processed, results, durationMs, error } = e.data;

      if (type === "progress") {
        setProcessingProgress(percent);
        setProcessedRows(processed);
      } else if (type === "complete") {
        setIsProcessing(false);
        setProcessingProgress(100);
        setProcessedRows(datasetSize);
        setProcessingTimeMs(durationMs);

        // Map top samples for comparative grid
        const samples = results.map((targetItem: any, index: number) => ({
          source: hugeDataset[index],
          target: targetItem
        }));
        setConvertedSamples(samples);

        // Add to historical pipeline runs
        const throughput = Math.round(datasetSize / (durationMs / 1000));
        const newHistoryItem: SchemaMappingHistory = {
          id: `run-${Date.now()}`,
          timestamp: "Just now",
          sourceRows: datasetSize,
          targetRows: datasetSize,
          durationMs: Math.round(durationMs),
          status: "success",
          throughput: throughput
        };
        setHistory([newHistoryItem, ...history]);
        worker.terminate();
      } else if (type === "error") {
        setIsProcessing(false);
        alert(`Error executing dynamic mapping function: ${error}`);
        worker.terminate();
      }
    };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Workflow className="w-5.5 h-5.5 text-[#3b82f6]" />
          Dynamical Schema Converter & Processor
        </h2>
        <p className="text-sm text-[#71717a] mt-1">
          Perform heavy schema transformations in background threads. Define inputs, leverage Gemini AI to suggest executable JavaScript mapping configurations, and run sub-millisecond compilations on millions of rows.
        </p>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Schemas configuration & AI Mapping */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3b82f6]" />
              1. Define Schema Mapping Target
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source JSON Sample Editor */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider block">
                  Source Schema Object (JSON)
                </span>
                <textarea
                  rows={8}
                  value={sourceDataStr}
                  onChange={(e) => setSourceDataStr(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 font-mono text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                  id="source-schema-textarea"
                />
              </div>

              {/* Target JSON Structure */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider block">
                  Target Schema Output (JSON)
                </span>
                <textarea
                  rows={8}
                  value={targetDataStr}
                  onChange={(e) => setTargetDataStr(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 font-mono text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                  id="target-schema-textarea"
                />
              </div>
            </div>

            {/* Ingestion Notes */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider block">
                Field Mapping & Parsing Instructions
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                id="mapping-instructions-input"
              />
            </div>

            {/* AI Call Button */}
            <button
              onClick={() => mappingMutation.mutate()}
              disabled={mappingMutation.isPending}
              className="w-full bg-[#3b82f6] hover:bg-blue-600 disabled:bg-blue-800 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
              id="ai-generate-mapper-btn"
            >
              {mappingMutation.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Executable JS Mapper Code...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask Gemini to Generate Mapper
                </>
              )}
            </button>
          </div>

          {/* Mapping Explanation Box */}
          <div className="bg-[#18181b]/40 border border-[#3b82f6]/20 rounded-xl p-5">
            <h4 className="text-xs font-bold text-[#3b82f6] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5" />
              Schema Mapping Explanation
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
              {mappingExplanation}
            </p>
          </div>
        </div>

        {/* Right Column: Code Editor & Web Worker Execution */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#3b82f6]" />
                2. Executable Mapping Logic (JS)
              </h3>

              <textarea
                rows={11}
                value={mapperCode}
                onChange={(e) => setMapperCode(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg p-3 font-mono text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                id="mapper-code-editor"
              />

              {/* Data Size Select */}
              <div>
                <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
                  Dataset Rows Size to Process
                </label>
                <div className="flex bg-[#18181b] border border-[#27272a] rounded-lg p-1">
                  {([10000, 50000, 100000] as const).map((size) => (
                     <button
                       key={size}
                       type="button"
                       onClick={() => setDatasetSize(size)}
                       className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                         datasetSize === size
                           ? "bg-[#3b82f6] text-white"
                           : "text-[#71717a] hover:text-white"
                       }`}
                     >
                       {size.toLocaleString()} rows
                     </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Button and Progress bar */}
            <div className="pt-4 border-t border-[#27272a] space-y-4">
              {isProcessing ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#71717a]">Processing Pipeline...</span>
                    <span className="text-[#3b82f6] font-bold">{processedRows.toLocaleString()} / {datasetSize.toLocaleString()} rows</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9] rounded-full transition-all duration-300" style={{ width: `${processingProgress}%` }} />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={executeDataPipeline}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
                  id="execute-pipeline-btn"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Execute Pipeline (Web Worker)
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Comparative Samples Grid (Renders once executed) */}
      {processingTimeMs !== null && (
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-4 animate-scale-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                Ingestion Job Complete
              </h3>
              <p className="text-xs text-[#71717a] mt-0.5">
                Comparative structure output mapping from converted records.
              </p>
            </div>

            {/* Performance Stats */}
            <div className="flex items-center gap-6 self-start sm:self-auto">
              <div className="text-left sm:text-right">
                <span className="block text-[10px] text-[#71717a] uppercase tracking-widest font-semibold">Total Duration</span>
                <span className="text-sm font-bold font-mono text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
                  {processingTimeMs.toFixed(1)} ms
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="block text-[10px] text-[#71717a] uppercase tracking-widest font-semibold">Throughput Speed</span>
                <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {Math.round(datasetSize / (processingTimeMs / 1000)).toLocaleString()} rows/sec
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Sample View */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider block">Source Record (Sample)</span>
              <pre className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-52">
                {JSON.stringify(convertedSamples[0]?.source, null, 2)}
              </pre>
            </div>

            {/* Output Converted Sample View */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider block">Target Record (Sample Result)</span>
              <pre className="bg-[#18181b] border border-[#27272a] p-4 rounded-lg font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-52">
                {JSON.stringify(convertedSamples[0]?.target, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Historical Pipeline Runs */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-[#71717a]" />
          Execution Ingestion History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-[#71717a] font-semibold uppercase tracking-wider pb-2">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Input Records</th>
                <th className="pb-3">Output Records</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Speed</th>
                <th className="pb-3 text-right">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] text-zinc-300">
              {history.map((run) => (
                <tr key={run.id} className="hover:bg-[#18181b]/30">
                  <td className="py-3 font-medium">{run.timestamp}</td>
                  <td className="py-3 font-mono">{run.sourceRows.toLocaleString()}</td>
                  <td className="py-3 font-mono">{run.targetRows.toLocaleString()}</td>
                  <td className="py-3 font-mono text-[#71717a]">{run.durationMs}ms</td>
                  <td className="py-3 font-mono text-emerald-400 font-bold">{run.throughput.toLocaleString()} rows/s</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold uppercase">
                      <Check className="w-3 h-3 stroke-[3]" /> Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
