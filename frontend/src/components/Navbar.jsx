import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf, Truck, UserCircle } from 'lucide-react';
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
    } else {
      setUser(null);
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
            
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {token && (
                <Link to="/dashboard" className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Dashboard
                </Link>
              )}
              
              <Link to="/browse-requests" className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/browse-requests') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                Browse Requests
              </Link>
              
              <Link to="/available-pickups" className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/available-pickups') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                Pickups
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden lg:block">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-tight">{user?.role}</p>
                  <p className="text-sm font-bold text-gray-700 leading-tight">{user?.full_name}</p>
                </div>
                <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <UserCircle className="w-6 h-6" />
                </div>
                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Sign In</Link>
                <Link to="/register" className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all hover:-translate-y-0.5">
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-2">
          {token && (
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-xl font-bold ${isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
              Dashboard
            </Link>
          )}
          <Link to="/browse-requests" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-xl font-bold ${isActive('/browse-requests') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
            Browse Requests
          </Link>
          <Link to="/available-pickups" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-xl font-bold ${isActive('/available-pickups') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
            Pickups
          </Link>
          <div className="pt-4 border-t border-gray-50">
            {token ? (
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl font-bold text-red-600 flex items-center gap-3">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 rounded-xl font-bold text-gray-600 bg-gray-50">Sign In</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 rounded-xl font-bold text-white bg-emerald-600">Join</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
