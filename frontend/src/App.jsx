import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Waste from './pages/Waste';
import Pickups from './pages/Pickups';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Routes>
      {/* Publicly accessible pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/browse-requests" element={<Waste />} />
      <Route path="/available-pickups" element={<Pickups />} />
      
      {/* Auth pages */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Fully protected pages */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Waste page is now dynamic: browse is public, create/edit is protected */}
      {/* We keep /waste as an alias or redirect for backwards compatibility */}
      <Route path="/waste" element={<Navigate to="/browse-requests" replace />} />
      <Route path="/pickups" element={<Navigate to="/available-pickups" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
