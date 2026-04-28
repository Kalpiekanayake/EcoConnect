import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf, Truck, UserCircle, PlusCircle, ListChecks, Sprout } from 'lucide-react';
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
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="container-custom">
        <div className={`bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] px-8 py-4 flex items-center justify-between shadow-corporate-xl transition-all duration-500 ${scrolled ? 'shadow-primary/5 bg-white/95' : ''}`}>
          <div className="flex items-center gap-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-all duration-500">
                <Leaf className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black text-dark-slate tracking-tighter group-hover:text-primary transition-colors">EcoConnect</span>
            </Link>

            <div className="hidden lg:flex items-center gap-4">
              {token && (
                <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              )}
              <NavLink to="/browse-requests" active={isActive('/browse-requests')}>Marketplace</NavLink>
              <NavLink to="/available-pickups" active={isActive('/available-pickups')}>Pickups</NavLink>
              
              {token && user?.role === 'HOUSEHOLD' && (
                <NavLink to="/my-requests" active={isActive('/my-requests')}>My Stream</NavLink>
              )}

              {token && user?.role === 'COLLECTOR' && (
                <NavLink to="/my-bookings" active={isActive('/my-bookings')}>My Jobs</NavLink>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {token ? (
              <div className="flex items-center gap-6 pl-8 border-l border-border-light">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-primary uppercase tracking-[0.3em] leading-none mb-1.5">{user?.role}</p>
                  <p className="text-xs font-extrabold text-dark-slate leading-none">{user?.full_name}</p>
                </div>
                <div className="h-10 w-10 bg-soft-mint rounded-xl flex items-center justify-center text-primary border border-primary/10 shadow-inner group cursor-pointer hover:bg-primary hover:text-white transition-all duration-500">
                  <UserCircle className="w-5 h-5" />
                </div>
                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-stone-50 text-muted-gray hover:text-red-600 hover:bg-red-50 transition-all active:scale-90 border border-border-light shadow-sm" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/login" className="text-xs font-bold text-muted-gray hover:text-primary transition-colors uppercase tracking-widest">Sign In</Link>
                <Link to="/register" className="px-8 py-3.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest">
                  Join Platform
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 rounded-2xl bg-soft-mint text-primary transition-all active:scale-90 border border-primary/10">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden mx-6 mt-4 bg-white/98 backdrop-blur-3xl rounded-[2.5rem] border border-border-light p-8 space-y-3 shadow-corporate-xl animate-fade-up">
          {token && (
            <MobileNavLink to="/dashboard" active={isActive('/dashboard')} onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
          )}
          <MobileNavLink to="/browse-requests" active={isActive('/browse-requests')} onClick={() => setIsMenuOpen(false)}>Marketplace</MobileNavLink>
          <MobileNavLink to="/available-pickups" active={isActive('/available-pickups')} onClick={() => setIsMenuOpen(false)}>Available Pickups</MobileNavLink>
          
          {token && (
             <div className="pt-6 border-t border-border-light flex flex-col gap-3">
                <div className="flex items-center gap-4 px-4 py-2">
                   <div className="w-12 h-12 bg-soft-mint rounded-2xl flex items-center justify-center text-primary">
                      <UserCircle className="w-7 h-7" />
                   </div>
                   <div>
                      <p className="text-sm font-extrabold text-dark-slate">{user?.full_name}</p>
                      <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">{user?.role}</p>
                   </div>
                </div>
                <button onClick={handleLogout} className="w-full py-5 rounded-2xl font-bold text-red-600 bg-red-50 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-xs">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
             </div>
          )}
          
          {!token && (
            <div className="grid grid-cols-2 gap-4 pt-4">
               <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-5 rounded-[1.5rem] font-bold text-muted-gray bg-stone-50 border border-border-light active:scale-95 transition-all text-xs uppercase tracking-widest">Sign In</Link>
               <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-5 rounded-[1.5rem] font-bold text-white bg-primary shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs uppercase tracking-widest">Join Now</Link>
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
    className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 uppercase tracking-widest ${
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
    className={`block px-6 py-5 rounded-[1.5rem] font-extrabold text-lg transition-all ${
      active 
      ? 'bg-primary text-white shadow-lg shadow-primary/10' 
      : 'text-muted-gray hover:bg-soft-mint hover:text-primary'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;

