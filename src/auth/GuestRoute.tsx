import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
export function GuestRoute() { const { isCloudAuthenticated, status } = useAuth(); if (status === "loading") return <main className="route-loading" aria-live="polite">Loading / טוען…</main>; return isCloudAuthenticated ? <Navigate to="/" replace /> : <Outlet />; }
