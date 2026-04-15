import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import LoadingSpinner from "../Loading_UI/LoadingSpinner.jsx";

export default function PrivateRoute({ children }) {
  const { user, loading } = useUser();

  // While checking (avoid flash)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If not logged in → redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
