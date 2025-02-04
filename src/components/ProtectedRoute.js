import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser; // Check if user is logged in

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
