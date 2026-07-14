import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
export function AuthenticatedRoute() { const { isCloudAuthenticated, status } = useAuth(); const location = useLocation(); if (status === "loading") return <main className="route-loading" aria-live="polite">Loading / טוען…</main>; return isCloudAuthenticated ? <Outlet /> : <Navigate to={`/auth/login?from=${encodeURIComponent(location.pathname)}`} replace />; }
