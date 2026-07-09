import * as React from "react";
import type { AuthType } from "@/types";
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

export interface ManualForm {
  name: string;
  url: string;
  auth_type: AuthType;
}

interface ImportResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tab: ImportTab, form: ManualForm) => void;
}

export function ImportResourceDialog({ open, onOpenChange, onSubmit }: ImportResourceDialogProps) {
  const [tab, setTab] = React.useState<ImportTab>("manual");
  const [form, setForm] = React.useState<ManualForm>({ name: "", url: "", auth_type: "none" });

  React.useEffect(() => {
    if (open) {
      setTab("manual");
      setForm({ name: "", url: "", auth_type: "none" });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent widthClassName="w-[480px]">
        <DialogTitle>Add API resource</DialogTitle>

        <div className="mb-[18px] flex gap-1.5 rounded-[9px] border border-border-strong bg-bg-0 p-1">
          {TABS.map((t) => (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
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
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Stripe Revenue"
              />
            </div>
            <div>
              <Label htmlFor="res-url">URL</Label>
              <Input
                id="res-url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
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
                <Select value={form.auth_type} onValueChange={(v) => setForm((f) => ({ ...f, auth_type: v as AuthType }))}>
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

        {tab === "postman" && (
          <div className="rounded-[10px] border-2 border-dashed border-border-strong p-[30px] text-center text-[13px] text-ink-3">
            Drop a Postman collection .json file, or click to browse
          </div>
        )}

        {tab === "openapi" && (
          <div>
            <Label htmlFor="res-openapi">OpenAPI/Swagger URL or file</Label>
            <Input id="res-openapi" placeholder="https://api.example.com/openapi.json" className="font-mono" />
          </div>
        )}

        {tab === "curl" && (
          <div>
            <Label htmlFor="res-curl">Paste cURL command</Label>
            <Textarea
              id="res-curl"
              placeholder="curl -H 'Authorization: Bearer ...' https://..."
              className="h-20"
            />
          </div>
        )}

        <div className="mt-[22px] flex justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(tab, form)}>Add &amp; test connection</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
