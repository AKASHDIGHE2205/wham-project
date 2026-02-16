// routes/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loadings from "../components/Loadings";
import type { RootState } from "../store/store";

const PublicRoute = () => {
  const { isAuthenticated, isAuthLoading } = useSelector(
    (state: RootState) => state.auth
  );

  if (isAuthLoading) return <Loadings />;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoute;
