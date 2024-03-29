import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (user && (user.ROLE === "WARE" || user.ROLE === "ADMIN")) {
    return children;
  } else {
    return <Navigate to={"auth/login"} />;
  }
}

export default PrivateRoute;
