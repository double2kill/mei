import { Navigate, Outlet } from "react-router-dom";
import { isAdminLoggedIn } from "./auth";

export function AdminRoute() {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
