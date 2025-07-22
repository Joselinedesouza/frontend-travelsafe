import { Navigate, Outlet } from "react-router-dom";

export function AdminRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
