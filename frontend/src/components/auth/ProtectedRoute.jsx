import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "international") {
      return <Navigate to="/student/overview" replace />;
    }

    if (user.role === "local") {
      return <Navigate to="/buddy/overview" replace />;
    }

    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
