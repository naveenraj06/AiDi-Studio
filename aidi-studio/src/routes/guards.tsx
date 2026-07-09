import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export function RequireAuth() {
  const { session } = useApp();
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicOnly() {
  const { session } = useApp();
  if (session) return <Navigate to="/projects" replace />;
  return <Outlet />;
}
