// src/shared/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/hooks";
import { LoadingScreen, ErrorScreen } from "@shared";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, authLoading, user } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role!)) {
    return <ErrorScreen title="Access Denied" message="You don't have permission to view this page." type="critical" />;
  }

  return <Outlet />;
}
