import * as React from "react";
import type { AuthType, HttpMethod } from "@/types";
import type { ParsedPostmanEndpoint } from "@/store/api/resourcesApi";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ImportTab = "manual" | "postman" | "openapi" | "curl";

const TABS: { key: ImportTab; label: string }[] = [
  { key: "manual", label: "Manual" },
  { key: "postman", label: "Postman" },
  { key: "openapi", label: "OpenAPI" },
  { key: "curl", label: "cURL" },
];

export interface ResourceFormResult {
  name: string;
  url: string;
  authType: AuthType;
  importedFrom: "postman" | "openapi" | "curl" | "manual";
}

interface ParsedRow extends ParsedPostmanEndpoint {
  selected: boolean;
}

interface ImportResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (result: ResourceFormResult) => void;
  submitting?: boolean;
  /** Pro/Org only — Free plan sees an upsell instead of the parse/import UI. */
  bulkImportAllowed: boolean;
  onParsePostman: (collection: unknown) => Promise<ParsedPostmanEndpoint[]>;
  onBulkImport: (items: { name: string; url: string; method: HttpMethod; authType: AuthType; authCredential?: string }[]) => Promise<void>;
}

const URL_PATTERN = /https?:\/\/\S+/;

export function ImportResourceDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  bulkImportAllowed,
  onParsePostman,
  onBulkImport,
}: ImportResourceDialogProps) {
  const [tab, setTab] = React.useState<ImportTab>("manual");
  const [manualForm, setManualForm] = React.useState({ name: "", url: "", authType: "none" as AuthType });
  const [openapiUrl, setOpenapiUrl] = React.useState("");
  const [curlCommand, setCurlCommand] = React.useState("");
  const [error, setError] = React.useState("");

  const [collectionText, setCollectionText] = React.useState("");
  const [parsing, setParsing] = React.useState(false);
  const [parsedRows, setParsedRows] = React.useState<ParsedRow[] | null>(null);
  const [importing, setImporting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTab("manual");
      setManualForm({ name: "", url: "", authType: "none" });
      setOpenapiUrl("");
      setCurlCommand("");
      setError("");
      setCollectionText("");
      setParsedRows(null);
    }
  }, [open]);

  const handleSubmit = () => {
    setError("");
    if (tab === "manual") {
      if (!manualForm.name.trim()) return setError("Enter a name");
      if (!URL_PATTERN.test(manualForm.url.trim())) return setError("Enter a valid https:// URL");
      onSubmit({ name: manualForm.name.trim(), url: manualForm.url.trim(), authType: manualForm.authType, importedFrom: "manual" });
      return;
    }
    if (tab === "openapi") {
      if (!URL_PATTERN.test(openapiUrl.trim())) return setError("Enter a valid OpenAPI URL");
      onSubmit({ name: "Imported OpenAPI Spec", url: openapiUrl.trim(), authType: "none", importedFrom: "openapi" });
      return;
    }
    if (tab === "curl") {
      const match = curlCommand.match(URL_PATTERN);
      if (!match) return setError("Couldn't find a URL in that command");
      const authType: AuthType = /authorization:\s*bearer/i.test(curlCommand) ? "bearer" : "none";
      onSubmit({ name: "Imported cURL Resource", url: match[0], authType, importedFrom: "curl" });
      return;
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCollectionText(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const handleParseCollection = async () => {
    setError("");
    let json: unknown;
    try {
      json = JSON.parse(collectionText);
    } catch {
      return setError("That's not valid JSON — paste a full Postman collection export");
    }
    setParsing(true);
    try {
      const items = await onParsePostman(json);
      setParsedRows(items.map((item) => ({ ...item, selected: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't parse that collection");
    } finally {
      setParsing(false);
    }
  };

  const handleImportSelected = async () => {
    if (!parsedRows) return;
    const selected = parsedRows.filter((r) => r.selected);
    if (selected.length === 0) return setError("Select at least one endpoint to import");
    setImporting(true);
    setError("");
    try {
      await onBulkImport(
        selected.map((r) => ({
          name: r.name,
          url: r.url,
          method: r.method,
          authType: r.authType,
          authCredential: r.authCredential,
        })),
      );
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't import the selected endpoints");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent widthClassName={parsedRows ? "w-[560px]" : "w-[480px]"}>
        <DialogTitle>Add API resource</DialogTitle>

        <div className="mb-[18px] flex gap-1.5 rounded-md border border-border-strong bg-bg-0 p-1">
          {TABS.map((t) => (
            <div
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setError("");
              }}
              className="flex-1 cursor-pointer rounded-md py-1.5 text-center text-[12px] font-semibold"
              style={{
                color: tab === t.key ? "#fff" : "var(--color-ink-2)",
                background: tab === t.key ? "var(--color-brand-violet)" : "transparent",
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {tab === "manual" && (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="res-name">Name</Label>
              <Input
                id="res-name"
                value={manualForm.name}
                onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Stripe Revenue"
              />
            </div>
            <div>
              <Label htmlFor="res-url">URL</Label>
              <Input
                id="res-url"
                value={manualForm.url}
                onChange={(e) => setManualForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://api.example.com/v1/data"
                className="font-mono"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label>Method</Label>
                <div className="mt-[5px] rounded-lg border border-border-strong bg-bg-0 px-3 py-2.5 text-[13px] text-ink-3">
                  GET (v1 only)
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="res-auth">Auth type</Label>
                <Select value={manualForm.authType} onValueChange={(v) => setManualForm((f) => ({ ...f, authType: v as AuthType }))}>
                  <SelectTrigger id="res-auth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bearer">Bearer</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth">OAuth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {tab === "postman" && !bulkImportAllowed && (
          <div className="rounded-lg border-2 border-dashed border-border-strong p-[30px] text-center text-[13px] text-ink-3">
            Bulk import is a Pro/Org feature — upgrade from the Billing page to import a Postman collection.
          </div>
        )}

        {tab === "postman" && bulkImportAllowed && !parsedRows && (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="res-postman-file">Upload a Postman collection export (.json)</Label>
              <input
                id="res-postman-file"
                type="file"
                accept="application/json"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="mt-[5px] w-full text-[12px] text-ink-2"
              />
            </div>
            <div>
              <Label htmlFor="res-postman-text">…or paste the collection JSON</Label>
              <Textarea
                id="res-postman-text"
                value={collectionText}
                onChange={(e) => setCollectionText(e.target.value)}
                placeholder='{ "info": { ... }, "item": [ ... ] }'
                className="h-28 font-mono text-[11px]"
              />
            </div>
            <Button onClick={handleParseCollection} disabled={parsing || !collectionText.trim()} variant="outline">
              {parsing ? "Parsing…" : "Parse collection"}
            </Button>
          </div>
        )}

        {tab === "postman" && bulkImportAllowed && parsedRows && (
          <div className="flex flex-col gap-2.5">
            <div className="text-[12px] text-ink-2">
              Found {parsedRows.length} endpoint{parsedRows.length === 1 ? "" : "s"} — select the ones to import.
            </div>
            <div className="max-h-[280px] overflow-y-auto rounded-lg border border-border-strong">
              {parsedRows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 border-b border-border-subtle px-3 py-2.5 text-[12px] last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={(e) =>
                      setParsedRows((rows) => rows!.map((r, ri) => (ri === i ? { ...r, selected: e.target.checked } : r)))
                    }
                  />
                  <span className="w-14 shrink-0 rounded-xs bg-bg-3 px-1.5 py-0.5 text-center font-mono text-[10px] font-bold text-ink-2">
                    {row.method}
                  </span>
                  <Input
                    value={row.name}
                    onChange={(e) =>
                      setParsedRows((rows) => rows!.map((r, ri) => (ri === i ? { ...r, name: e.target.value } : r)))
                    }
                    className="mt-0 h-7 flex-1 text-[12px]"
                  />
                  <span className="max-w-[140px] truncate font-mono text-[11px] text-ink-3">{row.url}</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setParsedRows(null)}>
              ← Parse a different collection
            </Button>
          </div>
        )}

        {tab === "openapi" && (
          <div>
            <Label htmlFor="res-openapi">OpenAPI/Swagger URL</Label>
            <Input
              id="res-openapi"
              value={openapiUrl}
              onChange={(e) => setOpenapiUrl(e.target.value)}
              placeholder="https://api.example.com/openapi.json"
              className="font-mono"
            />
            <div className="mt-1.5 text-[11px] text-ink-3">
              Registers this URL as a resource. Schema introspection isn't implemented yet — fine-tune field mapping manually in the widget builder.
            </div>
          </div>
        )}

        {tab === "curl" && (
          <div>
            <Label htmlFor="res-curl">Paste cURL command</Label>
            <Textarea
              id="res-curl"
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              placeholder="curl -H 'Authorization: Bearer ...' https://..."
              className="h-20"
            />
            <div className="mt-1.5 text-[11px] text-ink-3">
              We'll pull the URL (and Bearer auth, if present) out of the command.
            </div>
          </div>
        )}

        {error && <div className="mt-2.5 text-[11px] text-brand-red">{error}</div>}

        <div className="mt-[22px] flex justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {tab === "postman" ? (
            parsedRows && (
              <Button onClick={handleImportSelected} disabled={importing}>
                {importing ? "Importing…" : `Import ${parsedRows.filter((r) => r.selected).length} selected`}
              </Button>
            )
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Adding…" : "Add & test connection"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
