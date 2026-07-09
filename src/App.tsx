import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActiveTab } from "./types";
import LandingPage from "./components/LandingPage";
import SignIn from "./components/SignIn";
import DashboardShell from "./components/DashboardShell";
import ProjectsView from "./components/ProjectsView";
import DashboardsView from "./components/DashboardsView";
import WidgetsView from "./components/WidgetsView";
import SchemaConverterView from "./components/SchemaConverterView";
import EmbedView from "./components/EmbedView";
import TeamView from "./components/TeamView";
import SettingsView from "./components/SettingsView";

// Initialize Tanstack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("landing");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("marketing");
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("executive");

  const handleNavigateToDashboards = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab("dashboards");
  };

  const handleNavigateToWidgets = (dashboardId: string) => {
    setSelectedDashboardId(dashboardId);
    setActiveTab("widgets");
  };

  // Render core views depending on navigation state
  const renderTabContent = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsView onNavigateToDashboards={handleNavigateToDashboards} />;
      case "dashboards":
        return (
          <DashboardsView
            projectId={selectedProjectId}
            onBackToProjects={() => setActiveTab("projects")}
            onNavigateToWidgets={handleNavigateToWidgets}
          />
        );
      case "widgets":
        return (
          <WidgetsView
            selectedDashboardId={selectedDashboardId}
            onBackToDashboards={() => setActiveTab("dashboards")}
          />
        );
      case "schema":
        return <SchemaConverterView />;
      case "embed":
        return <EmbedView />;
      case "team":
        return <TeamView />;
      case "settings":
        return <SettingsView />;
      default:
        return <ProjectsView onNavigateToDashboards={handleNavigateToDashboards} />;
    }
  };

  if (activeTab === "landing") {
    return <LandingPage onNavigate={setActiveTab} />;
  }

  if (activeTab === "signin") {
    return <SignIn onNavigate={setActiveTab} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardShell activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </DashboardShell>
    </QueryClientProvider>
  );
}
