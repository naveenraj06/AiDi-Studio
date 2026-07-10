import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProjects } from "@/hooks/useProjects";

interface NavItem {
  key: string;
  icon: string;
  label: string;
  path: string;
}

export default function AppShell() {
  const { projectId } = useParams<{ projectId?: string }>();
  const { session, logout } = useApp();
  const { data: projects } = useProjects();
  const navigate = useNavigate();

  const currentProject = projectId ? projects?.find((p) => p.id === projectId) : null;

  const navDefs: NavItem[] = currentProject
    ? [
        { key: "dashboards", icon: "▦", label: "Dashboards", path: `/projects/${currentProject.id}/dashboards` },
        { key: "widgets", icon: "◨", label: "Widgets", path: `/projects/${currentProject.id}/widgets` },
        { key: "resources", icon: "⇄", label: "API Resources", path: `/projects/${currentProject.id}/resources` },
        { key: "embed", icon: "⧉", label: "Embed & SDK", path: `/projects/${currentProject.id}/embed` },
        { key: "team", icon: "◎", label: "Team", path: "/team" },
        { key: "billing", icon: "◈", label: "Billing", path: "/billing" },
      ]
    : [
        { key: "projects", icon: "◫", label: "All Projects", path: "/projects" },
        { key: "team", icon: "◎", label: "Team", path: "/team" },
        { key: "billing", icon: "◈", label: "Billing", path: "/billing" },
        { key: "settings", icon: "⚙", label: "Settings", path: "/settings" },
      ];

  const activeKey = (() => {
    const path = window.location.pathname;
    if (currentProject) {
      if (path.includes("/dashboards")) return "dashboards";
      if (path.includes("/widgets")) return "widgets";
      if (path.includes("/resources")) return "resources";
      if (path.includes("/embed")) return "embed";
    }
    if (path === "/team") return "team";
    if (path === "/billing") return "billing";
    if (path === "/settings") return "settings";
    if (path === "/projects") return "projects";
    return "";
  })();

  const userInitials = session?.user.display_name
    ? session.user.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
    : "";

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-border-default bg-bg-1">
        <div
          className="flex cursor-pointer items-center gap-2.5 px-5 pb-4 pt-5"
          onClick={() => navigate("/projects")}
        >
          <div
            className="h-[30px] w-[30px] shrink-0 rounded-lg"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }}
          />
          <div className="font-display text-[15px] font-bold tracking-[-0.01em] text-ink-1">AiDi Studio</div>
        </div>

        {currentProject && (
          <div
            className="mx-4 mb-3.5 mt-1 flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-border-strong bg-bg-2 px-3 py-2.5"
            onClick={() => navigate("/projects")}
          >
            <div
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md text-[11px]"
              style={{ background: currentProject.color }}
            >
              {currentProject.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-ink-1">
                {currentProject.name}
              </div>
              <div className="text-[10px] capitalize text-ink-3">{currentProject.plan} plan</div>
            </div>
            <div className="text-[10px] text-ink-3">⇄</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-1">
          {navDefs.map((item) => {
            const active = item.key === activeKey;
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.path)}
                className="my-px flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors hover:bg-bg-2 hover:text-ink-1"
                style={{
                  color: active ? "var(--color-ink-1)" : "var(--color-ink-2)",
                  background: active ? "var(--color-bg-3)" : "transparent",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span className="w-4 shrink-0 text-center text-[13px]">{item.icon}</span>
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-default p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-bg-2">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-bg-3 text-[11px] font-bold text-brand-violet-light">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-ink-1">
                {session?.user.display_name}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-ink-3">
                {session?.user.email}
              </div>
            </div>
            <div
              onClick={logout}
              title="Log out"
              className="shrink-0 cursor-pointer p-1 text-[12px] text-ink-3 hover:text-brand-red"
            >
              ⏻
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
