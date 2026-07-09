import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Suggest a mapping function to convert Schema A to Schema B using Gemini
  app.post("/api/schema/suggest-mapper", async (req, res) => {
    const { sourceSchema, targetSchema, notes } = req.body;

    if (!sourceSchema) {
      return res.status(400).json({ error: "Source schema description is required" });
    }

    try {
      const prompt = `You are an expert system mapping utility. Your goal is to generate a dynamic JavaScript mapper function that converts an object from a Source Schema to a Target Schema.

Source Schema / Example object:
${JSON.stringify(sourceSchema, null, 2)}

Target Schema / Example object (or goal description):
${typeof targetSchema === 'string' ? targetSchema : JSON.stringify(targetSchema, null, 2)}

Additional Mapping Instructions:
${notes || "None"}

Please output:
1. "mappingExplanation": A brief, user-friendly explanation of which fields map to which fields and any conversions done (e.g. converting timestamp to ISO, combining first and last name, extracting keys).
2. "mapperCode": An executable JavaScript function body (just the function body or an arrow function, e.g. "(source) => { return { ... }; }") that accepts a single "source" object and returns the converted "target" object. Ensure the code is safe, checks if fields exist, and doesn't crash.
3. "suggestedTargetSchema": The JSON schema of the resulting output.

Return your response in standard JSON with the keys: "mappingExplanation" (string), "mapperCode" (string), and "suggestedTargetSchema" (object).`;

      let resultText = "";
      
      // Attempt to call Gemini
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiClient();
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  mappingExplanation: {
                    type: Type.STRING,
                    description: "Explanation of how fields were mapped",
                  },
                  mapperCode: {
                    type: Type.STRING,
                    description: "Executable JS arrow function, e.g., (source) => { ... }",
                  },
                  suggestedTargetSchema: {
                    type: Type.OBJECT,
                    description: "Target JSON object showing converted structure",
                  }
                },
                required: ["mappingExplanation", "mapperCode", "suggestedTargetSchema"]
              }
            }
          });
          resultText = response.text || "";
        } catch (apiErr: any) {
          console.error("Gemini API error, falling back to mock generator:", apiErr);
        }
      }

      // If no API key or API call failed, generate a smart offline response
      if (!resultText) {
        // Simple fallback generator
        const sourceKeys = Object.keys(sourceSchema || {});
        const mappings: string[] = [];
        const codeLines: string[] = [];
        const targetObj: Record<string, any> = {};

        sourceKeys.forEach(key => {
          const val = sourceSchema[key];
          if (key.toLowerCase().includes("id")) {
            mappings.push(`- Mapping \`${key}\` directly as the primary identifier`);
            codeLines.push(`  id: source.${key} || Math.random().toString(36).substr(2, 9),`);
            targetObj["id"] = val;
          } else if (key.toLowerCase().includes("name")) {
            mappings.push(`- Mapping \`${key}\` to \`displayName\` for target conformity`);
            codeLines.push(`  displayName: source.${key} || "N/A",`);
            targetObj["displayName"] = val;
          } else if (key.toLowerCase().includes("date") || key.toLowerCase().includes("time")) {
            mappings.push(`- Parsing \`${key}\` date string to standard ISO format`);
            codeLines.push(`  timestamp: source.${key} ? new Date(source.${key}).toISOString() : new Date().toISOString(),`);
            targetObj["timestamp"] = "2026-07-08T06:03:00.000Z";
          } else if (typeof val === "number") {
            mappings.push(`- Mapping numeric field \`${key}\` directly, fallback to 0`);
            codeLines.push(`  ${key}: typeof source.${key} === 'number' ? source.${key} : 0,`);
            targetObj[key] = val;
          } else {
            mappings.push(`- Mapping \`${key}\` directly`);
            codeLines.push(`  ${key}: source.${key},`);
            targetObj[key] = val;
          }
        });

        const defaultCode = `(source) => {\n  return {\n${codeLines.join("\n")}\n  };\n}`;
        const defaultExplanation = `Offline Mapping Suggestion (Gemini API key not configured or unreachable):\n\n${mappings.join("\n")}\n\nProcessed ${sourceKeys.length} source keys into standardized format.`;

        resultText = JSON.stringify({
          mappingExplanation: defaultExplanation,
          mapperCode: defaultCode,
          suggestedTargetSchema: targetObj
        });
      }

      res.setHeader("Content-Type", "application/json");
      res.send(resultText);

    } catch (err: any) {
      console.error("Error generating schema mapper:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // AI suggest widget visualization and sample response schema
  app.post("/api/widget/ai-suggest", async (req, res) => {
    const { widgetGoal, apiEndpoint, apiMethod, requestPayload } = req.body;

    if (!widgetGoal) {
      return res.status(400).json({ error: "Widget goal/description is required" });
    }

    try {
      const prompt = `You are an expert AI dashboard architect. A user wants to build a custom dashboard widget to achieve this goal: "${widgetGoal}".
API Context:
- Endpoint: ${apiEndpoint || "Not specified"}
- Method: ${apiMethod || "GET"}
- Request Payload: ${requestPayload || "None"}

Your job is to:
1. Recommend the best visual component type for this goal. Choose EXACTLY one from: "line", "bar", "donut", "kpi", "table", "map".
2. Provide a clear reasoning/explanation for why this visualization is the most effective.
3. Generate a recommended JSON schema of the expected API response.
4. Generate highly realistic sample JSON mock response data that perfectly fits the recommended component's expected data structure, ensuring it can be parsed and rendered immediately in standard frontend visualization widgets.

Data structure contracts for components:
- "line": An array of objects with a "name" key (string for X-axis) and a numeric data key (e.g. "value" or "sales" or custom numeric field name). Example: [{"name": "Jan", "value": 150}, ...]
- "bar": An array of objects with a "name" key (string for X-axis) and a numeric data key (e.g. "value" or "count" or custom numeric field name). Example: [{"name": "Chrome", "value": 450}, ...]
- "donut": An array of objects with "name" (string), "value" (number), and optional "color" (hex color code string). Example: [{"name": "Organic", "value": 300, "color": "#3b82f6"}, ...]
- "kpi": A single object containing: "amount" (string with formatted number, e.g., "$12,450" or "94.2%"), "trend" (string with percentage change e.g., "+8.4%" or "-2.1%"), and optional "text" (string title/description). Example: {"amount": "$12,450", "trend": "+8.4%", "text": "Monthly Revenue"}
- "table": An array of flat JSON objects (at least 3-4 rows) with consistent keys. Example: [{"name": "Acme Corp", "industry": "SaaS", "ltv": "$12,000"}, ...]
- "map": An array of objects containing "country" (string name, e.g. "United States", "Germany") and "percentage" (number from 0 to 100). Example: [{"country": "United States", "percentage": 55}, ...]

Return your response in standard JSON with these exact keys: "componentSuggestion" (string), "explanation" (string), "suggestedSchema" (object), and "sampleData" (object or array).`;

      let resultText = "";

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiClient();
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  componentSuggestion: {
                    type: Type.STRING,
                    description: "Strictly one of: 'line', 'bar', 'donut', 'kpi', 'table', 'map'",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "The user-friendly justification for selecting this visualization model",
                  },
                  suggestedSchema: {
                    type: Type.OBJECT,
                    description: "JSON schema structure explaining the format of the output fields",
                  },
                  sampleData: {
                    type: Type.OBJECT,
                    description: "Realistic mock data fitting the component data structure contract",
                  }
                },
                required: ["componentSuggestion", "explanation", "suggestedSchema", "sampleData"]
              }
            }
          });
          resultText = response.text || "";
        } catch (apiErr: any) {
          console.error("Gemini API error in suggest-widget route, falling back to offline logic:", apiErr);
        }
      }

      if (!resultText) {
        // High fidelity smart offline rule fallback
        const goalLower = widgetGoal.toLowerCase();
        let suggestion: "line" | "bar" | "donut" | "kpi" | "table" | "map" = "line";
        let reason = "Selected dynamic line charts based on temporal/trending query characteristics.";
        let schemaObj: any = { type: "array", items: { name: "string", value: "number" } };
        let mockRes: any = [
          { name: "Mon", value: 120 },
          { name: "Tue", value: 150 },
          { name: "Wed", value: 180 },
          { name: "Thu", value: 210 },
          { name: "Fri", value: 240 },
        ];

        if (goalLower.includes("kpi") || goalLower.includes("revenue") || goalLower.includes("total") || goalLower.includes("sum") || goalLower.includes("metric")) {
          suggestion = "kpi";
          reason = "Selected metric summation (KPI Card) for prominent tracking of total financial indicators.";
          schemaObj = { amount: "string", trend: "string", text: "string" };
          mockRes = { amount: "$145,280", trend: "+14.2%", text: "Total Revenue Stream" };
        } else if (goalLower.includes("ratio") || goalLower.includes("percentage") || goalLower.includes("donut") || goalLower.includes("pie") || goalLower.includes("share") || goalLower.includes("percent")) {
          suggestion = "donut";
          reason = "Selected circular ratio distribution (Donut Chart) to easily visualize segmentation share.";
          schemaObj = { type: "array", items: { name: "string", value: "number", color: "string" } };
          mockRes = [
            { name: "SaaS Inflow", value: 540, color: "#4f46e5" },
            { name: "Ad Spend", value: 320, color: "#3b82f6" },
            { name: "Partner Referrals", value: 210, color: "#0d9488" },
          ];
        } else if (goalLower.includes("country") || goalLower.includes("region") || goalLower.includes("map") || goalLower.includes("geo")) {
          suggestion = "map";
          reason = "Selected geographical tracking matrix to highlight global dispersion percentages.";
          schemaObj = { type: "array", items: { country: "string", percentage: "number" } };
          mockRes = [
            { country: "United States", percentage: 52 },
            { country: "United Kingdom", percentage: 24 },
            { country: "Germany", percentage: 14 },
            { country: "Japan", percentage: 10 },
          ];
        } else if (goalLower.includes("table") || goalLower.includes("list") || goalLower.includes("user") || goalLower.includes("customer")) {
          suggestion = "table";
          reason = "Selected structured ledger grid to view raw records and detailed custom keys.";
          schemaObj = { type: "array", items: { name: "string", role: "string", status: "string" } };
          mockRes = [
            { name: "Alice Johnson", role: "Developer", status: "Active" },
            { name: "Bob Miller", role: "Designer", status: "Active" },
            { name: "Charlie Green", role: "Manager", status: "Pending" },
          ];
        } else if (goalLower.includes("bar") || goalLower.includes("compare") || goalLower.includes("category")) {
          suggestion = "bar";
          reason = "Selected standard comparison bar charts to analyze discrete product or category volumes.";
          schemaObj = { type: "array", items: { name: "string", value: "number" } };
          mockRes = [
            { name: "Enterprise Plan", value: 340 },
            { name: "Professional Plan", value: 510 },
            { name: "Starter Plan", value: 220 },
          ];
        }

        resultText = JSON.stringify({
          componentSuggestion: suggestion,
          explanation: `Offline AI Suggestion Fallback (Gemini API key not configured or unreachable):\n\n${reason}`,
          suggestedSchema: schemaObj,
          sampleData: mockRes
        });
      }

      res.setHeader("Content-Type", "application/json");
      res.send(resultText);

    } catch (err: any) {
      console.error("Error generating widget suggestion:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Serve Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist/ directory in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AiDi Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
