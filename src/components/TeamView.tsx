import React, { useState } from "react";
import { Users, UserPlus, Shield, Mail, Trash2, Check, Search } from "lucide-react";
import { TeamMember } from "../types";

export default function TeamView() {
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Alex Morgan",
      email: "alex@company.com",
      role: "Owner",
      avatar: "AM"
    },
    {
      id: "2",
      name: "Sarah Jenkins",
      email: "sarah.j@company.com",
      role: "Editor",
      avatar: "SJ"
    },
    {
      id: "3",
      name: "Michael Chang",
      email: "m.chang@company.com",
      role: "Viewer",
      avatar: "MC"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Editor" | "Viewer">("Editor");
  const [inviteName, setInviteName] = useState("");
  const [invited, setInvited] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMem: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      avatar: inviteName.split(" ").map(n => n[0]).join("").toUpperCase()
    };

    setTeam([...team, newMem]);
    setInviteEmail("");
    setInviteName("");
    setInvited(true);
    setTimeout(() => setInvited(false), 3000);
  };

  const handleDelete = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-[#3b82f6]" />
            Workspace Team Management
          </h2>
          <p className="text-sm text-[#71717a] mt-1">
            Manage your workspace administrators, dashboard editors, schema compilers, and read-only observers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Team Members list */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-[#71717a] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
              placeholder="Search team members..."
            />
          </div>

          <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden shadow-xl">
            <div className="divide-y divide-[#27272a]">
              {filteredTeam.map((member) => (
                <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#18181b]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-xs font-bold text-[#3b82f6] shrink-0">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-white truncate">{member.name}</span>
                      <span className="block text-[11px] text-[#71717a] font-mono truncate">{member.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                      member.role === "Owner"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : member.role === "Editor"
                        ? "bg-blue-500/10 text-[#3b82f6] border-blue-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}>
                      <Shield className="w-3 h-3" />
                      {member.role}
                    </span>

                    {member.role !== "Owner" && (
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-1 rounded text-[#71717a] hover:text-rose-400 hover:bg-rose-500/5 transition-colors cursor-pointer"
                        title="Remove member"
                        id={`delete-member-${member.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Invite Form */}
        <div className="lg:col-span-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#3b82f6]" />
              Invite New Member
            </h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a]" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="rachel@company.com"
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-2">
                  Role Permission
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                >
                  <option value="Editor">Editor (Edit Dashboards & Schemas)</option>
                  <option value="Viewer">Viewer (Read-Only Observer)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {invited ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Invitation Sent!
                  </>
                ) : (
                  "Send Invitation"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
