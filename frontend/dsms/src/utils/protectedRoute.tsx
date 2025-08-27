import { useEffect, type ReactNode } from "react";
import { useAuth, type User } from "../context/authContext";
import { useNavigate } from "react-router-dom";

interface ProtectedRoutesProps {
  children: ReactNode;
  requiredRole: Array<User["role"]>; // "admin" | "customer"[]
}

export const ProtectedRoutes = ({ children, requiredRole }: ProtectedRoutesProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!requiredRole.includes(user.role)) {
      navigate("/unauthorized");
      return;
    }
  }, [user, navigate, requiredRole]);

  if (!user) return null;
  if (!requiredRole.includes(user.role)) return null;

  return <>{children}</>;
};
