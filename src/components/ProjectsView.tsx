import React, { useState } from "react";
import { FolderKanban, Search, Plus, MoreVertical, LayoutDashboard, ToyBrick, Calendar, Sparkles } from "lucide-react";
import { Project } from "../types";

interface ProjectsViewProps {
  onNavigateToDashboards: (projectId: string) => void;
}

export default function ProjectsView({ onNavigateToDashboards }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "marketing",
      name: "Marketing Analytics",
      description: "Analyze campaign conversions, user signups, CPA, ad spend performance, and user retention.",
      dashboardsCount: 12,
      widgetsCount: 45,
      updatedAt: "Updated 2 days ago",
    },
    {
      id: "sales",
      name: "Sales Performance",
      description: "Track enterprise pipelines, monthly recurring revenue (MRR), quota achievements, and sales velocities.",
      dashboardsCount: 8,
      widgetsCount: 32,
      updatedAt: "Updated 1 day ago",
    },
    {
      id: "success",
      name: "Customer Success",
      description: "Measure customer churn rate, active usage levels, helpdesk ticket volumes, and NPS scoreboards.",
      dashboardsCount: 6,
      widgetsCount: 18,
      updatedAt: "Updated 3 days ago",
    },
    {
      id: "product",
      name: "Product Metrics",
      description: "Core product analytics, active feature triggers, API latency distributions, and user session records.",
      dashboardsCount: 9,
      widgetsCount: 27,
      updatedAt: "Updated 5 days ago",
    },
    {
      id: "finance",
      name: "Finance Overview",
      description: "General cashflows, balance sheets, operational expenditure (OpEx), burn rates, and financial forecasts.",
      dashboardsCount: 5,
      widgetsCount: 14,
      updatedAt: "Updated 1 week ago",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    const newProj: Project = {
      id: newProjectName.toLowerCase().replace(/\s+/g, "-"),
      name: newProjectName,
      description: newProjectDesc || "No description provided.",
      dashboardsCount: 0,
      widgetsCount: 0,
      updatedAt: "Created just now",
    };

    setProjects([newProj, ...projects]);
    setNewProjectName("");
    setNewProjectDesc("");
    setShowCreateModal(false);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5.5 h-5.5 text-[#3b82f6]" />
            Projects Workspace
          </h2>
          <p className="text-sm text-[#71717a] mt-1">
            Organize your analytics dashboards, reusable components, and dynamic ingestion schemas in distinct project environments.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all self-start cursor-pointer shadow-lg shadow-blue-500/20"
          id="create-project-btn"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#09090b] border border-[#27272a] p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 pl-10 pr-4 text-sm text-[#fafafa] placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
            placeholder="Search projects by name or description..."
            id="projects-search-input"
          />
        </div>
        <div className="text-xs text-[#71717a] font-medium whitespace-nowrap self-end sm:self-auto">
          Showing <span className="text-white font-semibold">{filteredProjects.length}</span> projects
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group relative bg-[#09090b] border border-[#27272a] hover:border-[#3b82f6]/30 p-6 rounded-xl transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer"
            onClick={() => onNavigateToDashboards(project.id)}
            id={`project-card-${project.id}`}
          >
            {/* Top row */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1e1b4b] text-[#3b82f6] flex items-center justify-center font-bold text-sm border border-blue-500/10">
                  {project.name.substring(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Optional more-actions list
                  }}
                  className="p-1 rounded text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b]"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-[#fafafa] group-hover:text-[#3b82f6] transition-colors mb-2">
                {project.name}
              </h3>
              <p className="text-xs text-[#71717a] leading-relaxed line-clamp-3 mb-6">
                {project.description}
              </p>
            </div>

            {/* Bottom details row */}
            <div className="border-t border-[#27272a] pt-4 flex items-center justify-between text-xs text-[#71717a] font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-600" />
                  {project.dashboardsCount}
                </span>
                <span className="flex items-center gap-1">
                  <ToyBrick className="w-3.5 h-3.5 text-zinc-600" />
                  {project.widgetsCount}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-zinc-650 font-mono">
                <Calendar className="w-3 h-3" />
                {project.updatedAt}
              </span>
            </div>
          </div>
        ))}

        {/* Create Project Empty State Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-[#27272a] hover:border-[#3b82f6]/30 bg-transparent rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-zinc-900/10 min-h-[220px]"
          id="create-project-card-trigger"
        >
          <div className="w-12 h-12 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-[#71717a] group-hover:text-[#3b82f6]" />
          </div>
          <span className="text-sm font-semibold text-[#fafafa] group-hover:text-[#3b82f6] transition-colors">
            Create New Project
          </span>
          <span className="text-xs text-[#71717a] mt-1 max-w-xs leading-relaxed">
            Provision a new workspace environment to store separate analytics datasets.
          </span>
        </div>
      </div>

      {/* Create Project Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                Create New Project
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#71717a] hover:text-[#fafafa] text-xs font-semibold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Enterprise Billing Insights"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                  id="new-project-name-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="A brief description of what this project monitors..."
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors resize-none"
                  id="new-project-desc-textarea"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#71717a] hover:text-white transition-colors"
                  id="modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  id="modal-submit-btn"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
