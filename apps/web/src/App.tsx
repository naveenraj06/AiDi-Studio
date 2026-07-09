import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { RequireAuth, PublicOnly } from "@/routes/guards";
import AppShell from "@/layouts/AppShell";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

import ProjectsPage from "@/pages/ProjectsPage";
import DashboardsListPage from "@/pages/DashboardsListPage";
import DashboardCanvasPage from "@/pages/DashboardCanvasPage";
import ResourcesPage from "@/pages/ResourcesPage";
import WidgetsLibraryPage from "@/pages/WidgetsLibraryPage";
import WidgetBuilderPage from "@/pages/WidgetBuilderPage";
import EmbedPage from "@/pages/EmbedPage";
import TeamPage from "@/pages/TeamPage";
import SettingsPage from "@/pages/SettingsPage";
import BillingPage from "@/pages/BillingPage";

import PublicDashboardPage from "@/pages/PublicDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />

          <Route element={<PublicOnly />}>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route path="/d/:slug" element={<PublicDashboardPage />} />
          <Route path="/d/:slug/unlock" element={<PublicDashboardPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/projects/:projectId/dashboards" element={<DashboardsListPage />} />
              <Route path="/projects/:projectId/dashboards/:dashboardId" element={<DashboardCanvasPage />} />
              <Route path="/projects/:projectId/resources" element={<ResourcesPage />} />
              <Route path="/projects/:projectId/widgets" element={<WidgetsLibraryPage />} />
              <Route path="/projects/:projectId/widgets/:widgetId" element={<WidgetBuilderPage />} />
              <Route path="/projects/:projectId/embed" element={<EmbedPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
