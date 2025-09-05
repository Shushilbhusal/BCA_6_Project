import React, { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router";

function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Clear user data from storage
    localStorage.clear();
    sessionStorage.clear();

    // Call logout from context (e.g., clearing state)
    logout();

    // Redirect user
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold text-gray-600">
        Logging you out...
      </p>
    </div>
  );
}

export default Logout;
