import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import API from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      API.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => handleLogout());
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-emerald-600 p-1.5 rounded-lg mr-2 group-hover:bg-emerald-700 transition-all">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Eco<span className="text-emerald-600">Connect</span>
              </span>
            </Link>
            
            {token && user && (
              <div className="hidden md:ml-10 md:flex md:space-x-4">
                <Link to="/dashboard" className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Dashboard
                </Link>
                {user.role === 'HOUSEHOLD' ? (
                  <Link to="/waste" className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/waste') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                    My Requests
                  </Link>
                ) : (
                  <Link to="/pickups" className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/pickups') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                    Available Pickups
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
                  <p className="text-sm font-bold text-gray-700">{user?.full_name}</p>
                </div>
                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-emerald-600">Sign In</Link>
                <Link to="/register" className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
