import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router";
import { isSignedIn } from "../auth";

export const RequireAuth = ({ children }: { children: ReactElement }) => {
  const location = useLocation();
  if (!isSignedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};