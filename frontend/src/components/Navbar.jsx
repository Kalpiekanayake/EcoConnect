import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import API from '../services/api';
import ecoLogo from '../assets/illustrations/eco-logo.png';

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
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${scrolled ? 'py-2' : 'py-3'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`px-4 py-2 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
          scrolled 
            ? 'bg-[#0a1223]/90 backdrop-blur-xl border-white/10 shadow-2xl' 
            : 'bg-[#0a1223]/60 backdrop-blur-md border-white/5 shadow-lg'
        }`}>
          <Link to="/" className="flex items-center gap-4 group">
            <img src={ecoLogo} alt="EcoConnect" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="text-3xl font-black tracking-tight flex items-center">
              <span className="text-primary">Eco</span>
              <span className="text-white">Connect</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 ml-10">
            {token && <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>}
            <NavLink to="/browse-requests" active={isActive('/browse-requests')}>Marketplace</NavLink>
            <NavLink to="/available-pickups" active={isActive('/available-pickups')}>Jobs</NavLink>
            {token && user?.role === 'HOUSEHOLD' && <NavLink to="/my-requests" active={isActive('/my-requests')}>History</NavLink>}
            {token && user?.role === 'COLLECTOR' && <NavLink to="/my-bookings" active={isActive('/my-bookings')}>My Bookings</NavLink>}
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {token ? (
              <div className="flex items-center gap-4 pl-8 border-l border-white/10">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 text-primary">{user?.role}</p>
                  <p className="text-xs font-bold leading-none text-white">{user?.full_name?.split(' ')[0]}</p>
                </div>
                <div className="h-8 w-8 rounded-full flex items-center justify-center border bg-white/10 border-white/20 text-white">
                  <UserCircle className="w-5 h-5" />
                </div>
                <button onClick={handleLogout} className="p-2 rounded-lg text-white/70 hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="py-2.5 px-8 text-[11px] font-black rounded-xl uppercase tracking-widest bg-white text-primary hover:bg-slate-100 transition-all shadow-xl shadow-primary/10">Join Now</Link>
              </div>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-white transition-colors">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 px-6 mt-2 animate-app-in">
          <div className="bg-[#0a1223]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
             <div className="flex flex-col gap-4">
                <Link to="/browse-requests" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white">Marketplace</Link>
                <Link to="/available-pickups" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-white">Jobs</Link>
                {!token ? (
                  <Link to="/login" className="py-3 px-8 text-sm font-black rounded-xl uppercase tracking-widest bg-white text-primary text-center">Login</Link>
                ) : (
                  <button onClick={handleLogout} className="text-left text-red-400 font-bold mt-4">Sign Out</button>
                )}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link to={to} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
    active 
      ? 'text-white bg-white/20' 
      : 'text-white/60 hover:text-white hover:bg-white/10'
  }`}>
    {children}
  </Link>
);

export default Navbar;


