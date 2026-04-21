import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Waste from './pages/Waste';
import Pickups from './pages/Pickups';
import MyRequests from './pages/MyRequests';
import MyBookings from './pages/MyBookings';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/browse-requests" element={<Waste />} />
      <Route path="/available-pickups" element={<Pickups />} />
      
      {/* Auth Pages */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Fully Protected Pages */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      
      {/* Dynamic Route: Creation/Editing happens inside /browse-requests for Households */}
      <Route path="/create-request" element={<Navigate to="/browse-requests" replace />} />
      
      {/* Legacy Redirects */}
      <Route path="/waste" element={<Navigate to="/my-requests" replace />} />
      <Route path="/pickups" element={<Navigate to="/available-pickups" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
