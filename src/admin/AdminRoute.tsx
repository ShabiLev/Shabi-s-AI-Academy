import { Navigate,Outlet } from "react-router-dom"; import { useAuth } from "../auth"; import { isVerifiedAdmin } from "./adminAuthorization";
export function AdminRoute(){const{user,status}=useAuth();if(status==="loading")return<main className="route-loading" aria-live="polite">Loading authorization / טוען הרשאה…</main>;return isVerifiedAdmin(user)?<Outlet/>:<Navigate to="/" replace/>;}
