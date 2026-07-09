import * as React from "react";
import { useApp } from "@/context/AppContext";
import type { ProjectRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials } from "@/lib/initials";
import { timeAgo } from "@/lib/timeAgo";

export default function TeamPage() {
  const { projects, teamByProject, actions, toast } = useApp();

  const [projectId, setProjectId] = React.useState(projects[0]?.id ?? "");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<ProjectRole>("editor");

  const activeProjectId = projectId || projects[0]?.id || "";
  const members = teamByProject[activeProjectId] || [];

  const onInvite = () => {
    const email = inviteEmail.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast("Enter a valid email", "error");
      return;
    }
    const id = "u" + Math.random().toString(36).slice(2, 6);
    const name = email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    actions.setTeam(activeProjectId, (list) => [
      ...list,
      { id, name, email, role: inviteRole, invited_at: new Date().toISOString() },
    ]);
    setInviteEmail("");
    toast("Invitation sent to " + email, "success");
  };

  const onRoleChange = (userId: string, role: ProjectRole) => {
    actions.setTeam(activeProjectId, (list) => list.map((m) => (m.id === userId ? { ...m, role } : m)));
    toast("Role updated", "success");
  };

  const onRemove = (userId: string) => {
    actions.setTeam(activeProjectId, (list) => list.filter((m) => m.id !== userId));
    toast("Member removed", "info");
  };

  return (
    <div className="max-w-[900px] px-11 py-9">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-display text-[24px] font-bold text-ink-1">Team</div>
          <div className="mt-1 text-[13px] text-ink-3">Manage members and roles per project.</div>
        </div>
        <Select value={activeProjectId} onValueChange={setProjectId}>
          <SelectTrigger className="mt-0 w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-[18px] overflow-hidden rounded-xl border border-border-default bg-bg-1">
        <div
          className="grid gap-2 border-b border-border-default px-[18px] py-3 text-[11px] uppercase tracking-[0.03em] text-ink-3"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 60px" }}
        >
          <div>Member</div>
          <div>Role</div>
          <div>Invited</div>
          <div />
        </div>
        {members.map((m) => {
          const isOwner = m.role === "owner";
          return (
            <div
              key={m.id}
              className="grid items-center gap-2 border-b border-border-subtle px-[18px] py-3.5 text-[13px] last:border-b-0"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 60px" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-3 text-[11px] font-bold text-brand-violet-light">
                  {initials(m.name)}
                </div>
                <div>
                  <div className="font-semibold text-ink-1">{m.name}</div>
                  <div className="text-[11px] text-ink-3">{m.email}</div>
                </div>
              </div>
              {isOwner ? (
                <div className="text-[12px] capitalize text-ink-2">Owner</div>
              ) : (
                <Select value={m.role} onValueChange={(v) => onRoleChange(m.id, v as ProjectRole)}>
                  <SelectTrigger className="mt-0 w-fit gap-2 py-1.5 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="text-[12px] text-ink-3">{timeAgo(m.invited_at)}</div>
              <div>
                {!isOwner && (
                  <div onClick={() => onRemove(m.id)} className="cursor-pointer text-right text-[12px] text-brand-red">
                    Remove
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-border-default bg-bg-1 p-[18px]">
        <Input
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="name@company.com"
          className="mt-0 flex-1"
        />
        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as ProjectRole)}>
          <SelectTrigger className="mt-0 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onInvite} className="whitespace-nowrap">
          Invite
        </Button>
      </div>
    </div>
  );
}
