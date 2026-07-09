import React, { useState } from "react";
import {
  FolderKanban,
  LayoutDashboard,
  ToyBrick,
  Database,
  Code2,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Activity,
  Workflow,
  Menu,
  X
} from "lucide-react";
import { ActiveTab } from "../types";

interface DashboardShellProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export default function DashboardShell({ activeTab, onTabChange, children }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: ActiveTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans flex relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Backdrop for Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - responsive sliding drawer on mobile, fixed sidebar on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#09090b] border-r border-[#27272a] flex flex-col z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex shrink-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#27272a] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-mono font-bold text-base text-white">Σ</span>
            </div>
            <div>
              <span className="font-sans font-bold text-sm tracking-tight text-[#fafafa] block">AiDi Studio</span>
              <span className="text-[10px] text-[#71717a] font-medium">Enterprise Analytics</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b] lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest px-3 mb-2">
            Workspace
          </div>

          {[
            { id: "projects", label: "Projects", icon: FolderKanban },
            { id: "dashboards", label: "Dashboards", icon: LayoutDashboard },
            { id: "widgets", label: "Widgets", icon: ToyBrick },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1e1b4b] text-[#3b82f6] border border-blue-500/20 shadow-sm"
                    : "text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b] border border-transparent"
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#3b82f6]" : "text-[#71717a]"}`} />
                {item.label}
              </button>
            );
          })}

          <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest px-3 pt-6 mb-2">
            Data & Dev
          </div>

          {[
            { id: "schema", label: "Schema Converter", icon: Workflow },
            { id: "embed", label: "Embed & SDK", icon: Code2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1e1b4b] text-[#3b82f6] border border-blue-500/20 shadow-sm"
                    : "text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b] border border-transparent"
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#3b82f6]" : "text-[#71717a]"}`} />
                {item.label}
              </button>
            );
          })}

          <div className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest px-3 pt-6 mb-2">
            Management
          </div>

          {[
            { id: "team", label: "Team", icon: Users },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1e1b4b] text-[#3b82f6] border border-blue-500/20 shadow-sm"
                    : "text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b] border border-transparent"
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#3b82f6]" : "text-[#71717a]"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Active Session Info */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center font-bold text-xs text-[#3b82f6]">
                AM
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#09090b]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-[#fafafa] truncate">Alex Morgan</span>
              <span className="block text-[10px] text-[#71717a] truncate">alex@company.com</span>
            </div>
          </div>
          <button
            onClick={() => handleTabChange("landing")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#71717a] hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-[#09090b] border-b border-[#27272a] px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger Toggle Button for mobile screens */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[#18181b] lg:hidden cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold tracking-tight text-[#fafafa] capitalize">
              {activeTab === "schema" ? "Schema Converter" : activeTab === "embed" ? "Embed & SDK" : activeTab}
            </h1>
            <div className="hidden sm:flex items-center gap-1 text-[10px] bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-2 py-0.5 rounded font-mono font-medium">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse mr-1" />
              NODE_ACTIVE: CLOUD_RUN
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Realtime pipeline status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-[11px] text-[#71717a]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[#d4d4d8]">Data Stream Online</span>
              <span className="text-zinc-700">|</span>
              <span className="font-mono text-[#3b82f6]">99.8% SLA</span>
            </div>

            {/* Quick Access Actions / User Panel dropdown */}
            <div className="relative group">
              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#d4d4d8] hover:text-white hover:bg-[#27272a] transition-colors"
                id="header-user-dropdown-btn"
              >
                <div className="w-5 h-5 rounded-full bg-[#3b82f6] flex items-center justify-center text-[9px] font-bold text-white">
                  AM
                </div>
                <span className="hidden sm:inline">Alex Morgan</span>
                <ChevronDown className="w-3 h-3 text-[#71717a]" />
              </button>
              {/* Simple dropdown menu on hover */}
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#09090b] border border-[#27272a] rounded-lg shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all text-xs text-[#71717a]">
                <button onClick={() => handleTabChange("settings")} className="w-full text-left px-4 py-2 hover:bg-[#18181b] hover:text-white transition-colors">Profile Settings</button>
                <button onClick={() => handleTabChange("team")} className="w-full text-left px-4 py-2 hover:bg-[#18181b] hover:text-white transition-colors">Team Members</button>
                <div className="border-t border-[#27272a] my-1" />
                <button onClick={() => handleTabChange("landing")} className="w-full text-left px-4 py-2 hover:bg-rose-950/10 hover:text-rose-400 transition-colors">Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Panel Scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative bg-[#09090b]">
          {children}
        </main>
      </div>
    </div>
  );
}
