import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetProjectsQuery } from "@/store/api/projectsApi";
import { useGetBillingQuery, useUpdateBillingMutation } from "@/store/api/billingApi";
import { useGetMyOrgQuery, useCreateOrgMutation } from "@/store/api/orgApi";
import { getErrorMessage } from "@/lib/errors";
import type { Plan } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLAN_DEFS: { key: Plan; name: string; price: string; limits: string }[] = [
  { key: "free", name: "Free", price: "$0", limits: "2 projects · 3 published dashboards · no collaboration" },
  { key: "pro", name: "Pro", price: "$9/mo", limits: "Unlimited projects & dashboards · bulk import · SDK embed" },
  { key: "org", name: "Org", price: "$25/mo", limits: "Everything in Pro · unlimited members · shared projects" },
];
const RANK: Record<Plan, number> = { free: 0, pro: 1, org: 2 };

export default function BillingPage() {
  const { toast } = useAuth();
  const { data: projects } = useGetProjectsQuery();
  const [projectId, setProjectId] = React.useState("");

  const activeProjectId = projectId || projects?.[0]?.id || "";
  const { data: billing, isLoading, isError } = useGetBillingQuery(activeProjectId, { skip: !activeProjectId });
  const [updateBilling, { isLoading: updatingBilling }] = useUpdateBillingMutation();
  const { data: myOrg } = useGetMyOrgQuery();
  const [createOrg, { isLoading: creatingOrg }] = useCreateOrgMutation();
  const [orgName, setOrgName] = React.useState("");
  const orgPanelRef = React.useRef<HTMLDivElement>(null);

  const onSelectPlan = async (planKey: Plan) => {
    try {
      await updateBilling({ projectId: activeProjectId, input: { plan: planKey } }).unwrap();
      toast(`Switched to ${planKey[0].toUpperCase() + planKey.slice(1)} plan`, "success");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't change plans"), "error");
    }
  };

  const onCreateOrg = async () => {
    if (!orgName.trim()) return toast("Enter an Org name", "error");
    try {
      const org = await createOrg({ projectId: activeProjectId, name: orgName.trim() }).unwrap();
      toast(`Org "${org.name}" created for ${org.domain}`, "success");
      setOrgName("");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't create the Org"), "error");
    }
  };

  const onManageCard = () => toast("Payment portal isn't connected yet — no real card is on file", "info");
  const onDownload = () => toast("Invoice downloads aren't available yet", "info");

  if (projects && projects.length === 0) {
    return (
      <div className="max-w-[900px] px-11 py-9">
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Create a project first — billing is managed per project.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] px-11 py-9">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-display text-[24px] font-bold text-ink-1">Billing</div>
          <div className="mt-1 text-[13px] text-ink-3">Plans and payment, per project.</div>
        </div>
        <Select value={activeProjectId} onValueChange={setProjectId}>
          <SelectTrigger className="mt-0 w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(projects ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="mb-7 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[140px] animate-pulse rounded-xl border border-border-default bg-bg-2" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mb-7 rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Couldn't load billing details. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && billing && (
        <>
          <div className="mb-7 grid grid-cols-3 gap-3">
            {PLAN_DEFS.map((pl) => {
              const isCurrent = pl.key === billing.plan;
              return (
                <div
                  key={pl.key}
                  className="relative rounded-xl border p-[18px]"
                  style={{
                    background: isCurrent ? "var(--color-surface-selected)" : "var(--color-bg-1)",
                    borderColor: isCurrent ? "var(--color-brand-violet)" : "var(--color-border-default)",
                  }}
                >
                  {isCurrent && (
                    <div className="absolute -top-[9px] left-3.5 rounded-full bg-brand-violet px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                      Current
                    </div>
                  )}
                  <div className="text-[13px] font-bold text-ink-1">{pl.name}</div>
                  <div className="font-display my-2 text-[22px] font-extrabold text-ink-1">{pl.price}</div>
                  <div className="mb-3.5 text-[11px] leading-[1.6] text-ink-2">{pl.limits}</div>
                  {!isCurrent && (
                    <div
                      onClick={
                        updatingBilling
                          ? undefined
                          : pl.key === "org"
                            ? () => orgPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                            : () => onSelectPlan(pl.key)
                      }
                      className="cursor-pointer rounded-sm border border-border-strong bg-bg-2 p-2 text-center text-[12px] font-semibold text-ink-1 hover:bg-bg-3"
                      style={updatingBilling ? { opacity: 0.6, pointerEvents: "none" } : undefined}
                    >
                      {pl.key === "org" ? "Create below ↓" : RANK[pl.key] > RANK[billing.plan] ? "Upgrade" : "Downgrade"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Card className="mb-[18px]" ref={orgPanelRef}>
            <div className="mb-4 text-[14px] font-semibold text-ink-1">Org</div>
            {billing.plan === "org" ? (
              myOrg ? (
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-ink-1">
                    <span className="font-semibold">{myOrg.name}</span>{" "}
                    <span className="text-ink-3">· @{myOrg.domain} · unlimited members</span>
                  </div>
                  <Link to="/team" className="text-[12px] text-brand-violet-light">
                    Manage teammates →
                  </Link>
                </div>
              ) : (
                <div className="text-[13px] text-ink-3">Loading your Org…</div>
              )
            ) : (
              <div>
                <div className="mb-3 text-[13px] text-ink-2">
                  Create an Org to collaborate — requires a business email (no gmail.com/yahoo.com/etc.). Teammates
                  must share your email domain.
                </div>
                <div className="flex gap-2.5">
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Org name, e.g. Acme Inc"
                    className="mt-0 flex-1"
                  />
                  <Button onClick={onCreateOrg} disabled={creatingOrg} className="whitespace-nowrap">
                    {creatingOrg ? "Creating…" : "Create your Org"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="mb-[18px]">
            <div className="mb-4 text-[14px] font-semibold text-ink-1">Payment method</div>
            {billing.card ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-[42px] items-center justify-center rounded-xs bg-bg-3 text-[10px] font-bold">
                    {billing.card.brand}
                  </div>
                  <div className="text-[13px] text-ink-1">
                    •••• {billing.card.last4} <span className="text-ink-3">exp {billing.card.exp}</span>
                  </div>
                </div>
                <div onClick={onManageCard} className="cursor-pointer text-[12px] text-brand-violet-light">
                  Update
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-ink-3">No payment method on file</div>
                <div onClick={onManageCard} className="cursor-pointer rounded-lg bg-brand-violet px-4 py-2 text-[12px] font-semibold text-white">
                  Add card
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4 text-[14px] font-semibold text-ink-1">Invoice history</div>
            {billing.invoices.length > 0 ? (
              billing.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between border-b border-border-subtle py-2.5 text-[13px] last:border-b-0"
                >
                  <div className="text-ink-2">{inv.date}</div>
                  <div className="font-semibold text-ink-1">${inv.amount}</div>
                  <div className="text-[11px] font-bold uppercase text-brand-green">{inv.status}</div>
                  <div onClick={onDownload} className="cursor-pointer text-[12px] text-brand-violet-light">
                    Download
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[13px] text-ink-3">No invoices yet.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
