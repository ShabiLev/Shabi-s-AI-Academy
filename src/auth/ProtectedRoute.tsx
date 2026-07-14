import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
export function ProtectedRoute() {
  const { isAuthenticated, status } = useAuth(); const location = useLocation();
  if (status === "loading") return <main className="route-loading" aria-live="polite">Loading account / טוען חשבון…</main>;
  const requested = `${location.pathname}${location.search}${location.hash}`;
  return isAuthenticated ? <Outlet /> : <Navigate to={`/login?from=${encodeURIComponent(requested)}`} replace />;
}
