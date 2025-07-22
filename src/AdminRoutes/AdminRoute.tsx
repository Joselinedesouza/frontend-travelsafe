
import { Navigate, Outlet } from "react-router-dom";

export const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    // Se non sei autenticato o non sei admin, redirect alla landing
    return <Navigate to="/" replace />;
  }

  // Se sei admin, rendi le rotte figlie
  return <Outlet />;
};
