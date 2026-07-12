import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

function SessionCheck() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-1">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-brand-violet" />
    </div>
  );
}

export function RequireAuth() {
  const { session, sessionLoading } = useAuth();
  if (sessionLoading) return <SessionCheck />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicOnly() {
  const { session, sessionLoading, isPasswordRecovery } = useAuth();
  if (sessionLoading) return <SessionCheck />;
  if (session && !isPasswordRecovery) return <Navigate to="/projects" replace />;
  return <Outlet />;
}
