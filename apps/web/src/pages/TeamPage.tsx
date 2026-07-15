import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetProjectsQuery } from "@/store/api/projectsApi";
import {
  useGetTeamQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from "@/store/api/teamApi";
import { getErrorMessage } from "@/lib/errors";
import type { ProjectRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials } from "@/lib/initials";
import { timeAgo } from "@/lib/timeAgo";

export default function TeamPage() {
  const { toast } = useAuth();
  const { data: projects } = useGetProjectsQuery();

  const [projectId, setProjectId] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<ProjectRole>("editor");

  const activeProjectId = projectId || projects?.[0]?.id || "";
  const activeProject = (projects ?? []).find((p) => p.id === activeProjectId);
  const isOrgProject = activeProject?.plan === "org";

  const {
    data: members,
    isLoading,
    isError,
  } = useGetTeamQuery(activeProjectId, { skip: !activeProjectId });
  const [inviteMember, { isLoading: inviting }] = useInviteMemberMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  const onInvite = async () => {
    const email = inviteEmail.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast("Enter a valid email", "error");
      return;
    }
    const name = email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    try {
      await inviteMember({
        projectId: activeProjectId,
        input: { name, email, role: inviteRole === "owner" ? "editor" : inviteRole },
      }).unwrap();
      setInviteEmail("");
      toast("Invitation sent to " + email, "success");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't send the invitation"), "error");
    }
  };

  const onRoleChange = async (userId: string, role: ProjectRole) => {
    try {
      await updateRole({ projectId: activeProjectId, id: userId, role }).unwrap();
      toast("Role updated", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't update the role"), "error");
    }
  };

  const onRemove = async (userId: string) => {
    try {
      await removeMember({ projectId: activeProjectId, id: userId }).unwrap();
      toast("Member removed", "info");
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't remove that member"), "error");
    }
  };

  if (projects && projects.length === 0) {
    return (
      <div className="max-w-[900px] px-11 py-9">
        <div className="rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Create a project first — team members are managed per project.
        </div>
      </div>
    );
  }

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
            {(projects ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="mb-[18px] flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border border-border-default bg-bg-2" />
          ))}
        </div>
      )}

      {isError && (
        <div className="mb-[18px] rounded-xl border border-border-default bg-bg-1 p-8 text-center text-[13px] text-ink-3">
          Couldn't load the team. Try refreshing.
        </div>
      )}

      {!isLoading && !isError && (
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
          {(members ?? []).map((m) => {
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
      )}

      {isOrgProject ? (
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
          <Button onClick={onInvite} disabled={inviting} className="whitespace-nowrap">
            {inviting ? "Inviting…" : "Invite"}
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border-strong bg-bg-1 p-[18px] text-center text-[13px] text-ink-3">
          Solo plans are solo — create an Org from the Billing page to invite teammates on your email domain.
        </div>
      )}
    </div>
  );
}
