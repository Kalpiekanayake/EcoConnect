import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Waste Manager', path: '/waste', icon: Trash2 },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center group">
              <div className="bg-green-600 p-1.5 rounded-lg mr-2 group-hover:bg-green-700 transition-colors">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                WasteManager
              </span>
            </Link>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className={`w-4 h-4 mr-2 ${isActive(link.path) ? 'text-green-600' : 'text-gray-400'}`} />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Logout */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-200">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.name}
                </div>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center">
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
