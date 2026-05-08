import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Leaf, UserCircle } from 'lucide-react';
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
      API.get('/auth/me').then(res => setUser(res.data)).catch(() => handleLogout());
    }
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [token]);

  const isActive = (path) => location.pathname === path;
  const isLanding = location.pathname === '/';
  const lightText = isLanding && !scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${scrolled ? 'nav-glass py-3 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6">
            <Leaf className="w-6 h-6 fill-current" />
          </div>
          <span className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${lightText ? 'text-white' : 'text-dark-slate'}`}>EcoConnect</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {token && <NavLink to="/dashboard" active={isActive('/dashboard')} light={lightText}>Dashboard</NavLink>}
          <NavLink to="/browse-requests" active={isActive('/browse-requests')} light={lightText}>Marketplace</NavLink>
          <NavLink to="/available-pickups" active={isActive('/available-pickups')} light={lightText}>Jobs</NavLink>
          {token && user?.role === 'HOUSEHOLD' && <NavLink to="/my-requests" active={isActive('/my-requests')} light={lightText}>History</NavLink>}
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {token ? (
            <div className={`flex items-center gap-4 pl-6 border-l transition-colors duration-300 ${lightText ? 'border-white/20' : 'border-border-light'}`}>
              <div className="text-right">
                <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${lightText ? 'text-primary' : 'text-primary'}`}>{user?.role}</p>
                <p className={`text-xs font-bold leading-none ${lightText ? 'text-white' : 'text-dark-slate'}`}>{user?.full_name?.split(' ')[0]}</p>
              </div>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center border transition-colors duration-300 ${lightText ? 'bg-white/10 border-white/20 text-white' : 'bg-bg-app border-border-light text-muted-gray'}`}>
                <UserCircle className="w-6 h-6" />
              </div>
              <button onClick={handleLogout} className={`p-2 rounded-lg transition-colors ${lightText ? 'text-white/70 hover:text-white' : 'text-muted-gray hover:text-red-500'}`}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link to="/login" className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${lightText ? 'text-white/80 hover:text-white' : 'text-muted-gray hover:text-primary'}`}>Login</Link>
              <Link to="/register" className={`py-3 px-8 text-xs font-black rounded-xl uppercase tracking-widest transition-all ${lightText ? 'bg-white text-primary hover:bg-slate-100' : 'btn-service'}`}>Join Now</Link>
            </div>
          )}
        </div>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden p-2 transition-colors ${lightText ? 'text-white' : 'text-dark-slate'}`}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-border-light p-6 animate-app-in shadow-xl">
           <div className="flex flex-col gap-4">
              <Link to="/browse-requests" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Marketplace</Link>
              <Link to="/available-pickups" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold">Jobs</Link>
              {!token ? (
                <Link to="/login" className="btn-service w-full mt-4 flex items-center justify-center">Login</Link>
              ) : (
                <button onClick={handleLogout} className="text-left text-red-500 font-bold mt-4">Sign Out</button>
              )}
           </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, active, light, children }) => (
  <Link to={to} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
    active 
      ? (light ? 'text-white bg-white/20' : 'text-primary bg-primary/5') 
      : (light ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-gray hover:text-primary hover:bg-primary/5')
  }`}>
    {children}
  </Link>
);

export default Navbar;


