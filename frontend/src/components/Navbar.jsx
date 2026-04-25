import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf, Truck, UserCircle, PlusCircle, ListChecks } from 'lucide-react';
import { useState, useEffect } from 'react';
import API from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
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

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [token]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] px-8 py-4 flex items-center justify-between shadow-2xl shadow-gray-200/50 transition-all duration-500 ${scrolled ? 'mx-0 shadow-emerald-900/5 bg-white/90' : 'mx-4'}`}>
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-11 w-11 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:rotate-6 transition-all duration-500 group-hover:scale-110">
                <Leaf className="w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black text-dark-slate tracking-behance group-hover:text-primary transition-colors">EcoConnect</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {token && (
                <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              )}
              <NavLink to="/browse-requests" active={isActive('/browse-requests')}>Browse</NavLink>
              <NavLink to="/available-pickups" active={isActive('/available-pickups')}>Pickups</NavLink>
              
              {token && user?.role === 'HOUSEHOLD' && (
                <NavLink to="/my-requests" active={isActive('/my-requests')}>My Requests</NavLink>
              )}

              {token && user?.role === 'COLLECTOR' && (
                <NavLink to="/my-bookings" active={isActive('/my-bookings')}>My Bookings</NavLink>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {token ? (
              <div className="flex items-center gap-5 pl-6 border-l border-gray-100">
                <div className="text-right">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] leading-none mb-1">{user?.role}</p>
                  <p className="text-sm font-bold text-dark-slate leading-none">{user?.full_name}</p>
                </div>
                <div className="h-11 w-11 bg-soft-mint rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-inner group cursor-pointer hover:bg-primary hover:text-white transition-all duration-500">
                  <UserCircle className="w-6 h-6" />
                </div>
                <button onClick={handleLogout} className="p-3 rounded-2xl bg-off-white text-muted-gray hover:text-red-600 hover:bg-red-50 transition-all active:scale-90 shadow-sm" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-bold text-muted-gray hover:text-primary transition-colors">Sign In</Link>
                <Link to="/register" className="px-8 py-4 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-deep-forest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Join Platform
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 rounded-2xl bg-soft-mint text-primary transition-all active:scale-90">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Behance style */}
      {isMenuOpen && (
        <div className="lg:hidden mx-6 mt-4 bg-white/95 backdrop-blur-2xl rounded-[3rem] border border-gray-100 p-8 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          {token && (
            <MobileNavLink to="/dashboard" active={isActive('/dashboard')} onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
          )}
          <MobileNavLink to="/browse-requests" active={isActive('/browse-requests')} onClick={() => setIsMenuOpen(false)}>Browse Requests</MobileNavLink>
          <MobileNavLink to="/available-pickups" active={isActive('/available-pickups')} onClick={() => setIsMenuOpen(false)}>Available Pickups</MobileNavLink>
          
          {token && (
             <div className="pt-6 border-t border-gray-50 flex flex-col gap-4">
                <div className="flex items-center gap-4 px-4">
                   <div className="w-12 h-12 bg-soft-mint rounded-2xl flex items-center justify-center text-primary">
                      <UserCircle className="w-7 h-7" />
                   </div>
                   <div>
                      <p className="text-sm font-black text-dark-slate">{user?.full_name}</p>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{user?.role}</p>
                   </div>
                </div>
                <button onClick={handleLogout} className="w-full py-5 rounded-2xl font-bold text-red-600 bg-red-50 flex items-center justify-center gap-3 active:scale-95 transition-all">
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
             </div>
          )}
          
          {!token && (
            <div className="grid grid-cols-2 gap-4 pt-4">
               <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-5 rounded-2xl font-bold text-muted-gray bg-off-white active:scale-95 transition-all">Sign In</Link>
               <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-5 rounded-2xl font-bold text-white bg-primary shadow-xl shadow-primary/20 active:scale-95 transition-all">Join Now</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link 
    to={to} 
    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${
      active 
      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
      : 'text-muted-gray hover:text-primary hover:bg-soft-mint'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, active, onClick, children }) => (
  <Link 
    to={to} 
    onClick={onClick} 
    className={`block px-6 py-5 rounded-[2rem] font-bold text-lg transition-all ${
      active 
      ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
      : 'text-muted-gray hover:bg-soft-mint hover:text-primary'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
