import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Waste from './pages/Waste';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Placeholder for Pickups page until created
const Pickups = () => (
  <div className="min-h-screen bg-[#FDFCFB]">
    <Navbar />
    <div className="max-w-6xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Available Pickups</h1>
      <p className="text-gray-500 font-bold italic">This view is coming soon for our Collectors!</p>
    </div>
  </div>
);
import Navbar from './components/Navbar';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/waste" element={<ProtectedRoute><Waste /></ProtectedRoute>} />
      <Route path="/pickups" element={<ProtectedRoute><Pickups /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
