import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Redirect to login with current location so we can return after login
    // and pass a state message to show why they were redirected
    return <Navigate 
      to="/login" 
      state={{ 
        from: location, 
        message: "Please login to access this feature." 
      }} 
      replace 
    />;
  }

  return children;
};

export default ProtectedRoute;
