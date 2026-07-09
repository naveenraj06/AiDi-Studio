import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Projects from "@/pages/Projects";
import DashboardsList from "@/pages/DashboardsList";
import ApiLibrary from "@/pages/ApiLibrary";
import WidgetsLibrary from "@/pages/WidgetsLibrary";
import WidgetBuilder from "@/pages/WidgetBuilder";
import DashboardCanvas from "@/pages/DashboardCanvas";
import PublicView from "@/pages/PublicView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/app/projects" element={<Projects />} />
        <Route path="/app/projects/:projectId/dashboards" element={<DashboardsList />} />
        <Route path="/app/projects/:projectId/dashboards/:dashboardId" element={<DashboardCanvas />} />
        <Route path="/app/projects/:projectId/api-library" element={<ApiLibrary />} />
        <Route path="/app/projects/:projectId/widgets" element={<WidgetsLibrary />} />
        <Route path="/app/projects/:projectId/widgets/new" element={<WidgetBuilder />} />

        <Route path="/d/:slug" element={<PublicView />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
