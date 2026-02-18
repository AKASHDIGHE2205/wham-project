import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loadings from "../components/Loadings";
import type { RootState } from "../store/store";
import { getUserFromStorage } from "../helper/cryptoUser";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isAuthLoading } = useSelector((state: RootState) => state.auth);
  const user = getUserFromStorage();

  if (isAuthLoading) return <Loadings />;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // role-based check (if roles provided)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
