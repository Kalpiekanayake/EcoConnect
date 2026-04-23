import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf, Truck, UserCircle, PlusCircle, ListChecks } from 'lucide-react';
import { useState, useEffect } from 'react';
import API from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    if (token) {
      API.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => handleLogout());
    } else {
      setUser(null);
    }
  }, [token]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-emerald-600 p-2 rounded-xl mr-3 group-hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">
                Eco<span className="text-emerald-600">Connect</span>
              </span>
            </Link>
            
            <div className="hidden lg:ml-12 lg:flex lg:space-x-2">
              {token && (
                <Link to="/dashboard" className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
                  Dashboard
                </Link>
              )}
              
              <Link to="/browse-requests" className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${isActive('/browse-requests') ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
                Browse Requests
              </Link>
              
              <Link to="/available-pickups" className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${isActive('/available-pickups') ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
                Pickups
              </Link>

              {token && user?.role === 'HOUSEHOLD' && (
                <Link to="/my-requests" className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${isActive('/my-requests') ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
                  My Requests
                </Link>
              )}

              {token && user?.role === 'COLLECTOR' && (
                <Link to="/my-bookings" className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${isActive('/my-bookings') ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
                  My Bookings
                </Link>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {token ? (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">{user?.role}</p>
                  <p className="text-sm font-black text-gray-900 leading-none">{user?.full_name}</p>
                </div>
                <div className="h-12 w-12 bg-[#FAF9F6] rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner border border-white">
                  <UserCircle className="w-7 h-7" />
                </div>
                <button onClick={handleLogout} className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-black text-gray-500 hover:text-emerald-600 transition-colors">Sign In</Link>
                <Link to="/register" className="px-8 py-3.5 bg-emerald-600 text-white text-sm font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1">
                  Join Platform
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 rounded-2xl bg-[#FAF9F6] text-gray-400 border border-gray-50">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 py-6 px-6 space-y-3 animate-in slide-in-from-top-4 duration-300">
          {token && (
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`block px-5 py-4 rounded-2xl font-black ${isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}>
              Dashboard
            </Link>
          )}
          <Link to="/browse-requests" onClick={() => setIsMenuOpen(false)} className={`block px-5 py-4 rounded-2xl font-black ${isActive('/browse-requests') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}>
            Browse Requests
          </Link>
          <Link to="/available-pickups" onClick={() => setIsMenuOpen(false)} className={`block px-5 py-4 rounded-2xl font-black ${isActive('/available-pickups') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}>
            Pickups
          </Link>
          {token && user?.role === 'HOUSEHOLD' && (
            <Link to="/my-requests" onClick={() => setIsMenuOpen(false)} className={`block px-5 py-4 rounded-2xl font-black ${isActive('/my-requests') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}>
                My Requests
            </Link>
          )}
          {token && user?.role === 'COLLECTOR' && (
            <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)} className={`block px-5 py-4 rounded-2xl font-black ${isActive('/my-bookings') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-400'}`}>
                My Bookings
            </Link>
          )}
          <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
            {token ? (
              <button onClick={handleLogout} className="w-full py-4 rounded-2xl font-black text-red-600 bg-red-50 flex items-center justify-center gap-3">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-4 rounded-2xl font-black text-gray-500 bg-[#FAF9F6]">Sign In</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-4 rounded-2xl font-black text-white bg-emerald-600 shadow-lg shadow-emerald-100">Join</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
