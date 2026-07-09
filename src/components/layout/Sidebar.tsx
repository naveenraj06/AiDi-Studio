import { NavLink, useParams } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FolderKanban, Plug, LayoutGrid, LayoutDashboard, Code2, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: (pid: string) => `/app/projects`, icon: FolderKanban, label: "Projects", match: "projects-root" },
  { to: (pid: string) => `/app/projects/${pid}/api-library`, icon: Plug, label: "API Library", match: "api-library" },
  { to: (pid: string) => `/app/projects/${pid}/widgets`, icon: LayoutGrid, label: "Widgets", match: "widgets" },
  { to: (pid: string) => `/app/projects/${pid}/dashboards`, icon: LayoutDashboard, label: "Dashboards", match: "dashboards" },
  { to: (pid: string) => `/app/projects/${pid}/embed`, icon: Code2, label: "Embed & SDK", match: "embed" },
];

export function Sidebar() {
  const params = useParams();
  const projectId = params.projectId || "marketing-analytics";

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-border bg-bg-1">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Logo size={22} />
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to(projectId)}
              className={({ isActive }) =>
                cn(
                  "relative mx-0 flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors",
                  isActive
                    ? "bg-brand-violet/12 text-ink-1 font-medium"
                    : "text-ink-2 hover:bg-bg-2 hover:text-ink-1"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-brand-violet" />}
                  <Icon className="h-4 w-4" />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="mt-4 border-t border-border pt-3">
          <NavLink
            to="/app/team"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors",
                isActive ? "bg-brand-violet/12 text-ink-1 font-medium" : "text-ink-2 hover:bg-bg-2 hover:text-ink-1"
              )
            }
          >
            <Users className="h-4 w-4" />
            Team
          </NavLink>
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors",
                isActive ? "bg-brand-violet/12 text-ink-1 font-medium" : "text-ink-2 hover:bg-bg-2 hover:text-ink-1"
              )
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </div>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-border p-3.5">
        <Avatar>
          <AvatarFallback>NR</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-[12px] font-medium text-ink-1">Naveenraj</div>
          <div className="text-[10px] text-ink-3">Admin</div>
        </div>
      </div>
    </aside>
  );
}
