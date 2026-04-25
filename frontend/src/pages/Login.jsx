import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const authMessage = location.state?.message;

  useEffect(() => {
    if (authMessage) {
      setError(authMessage);
    }
  }, [authMessage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatError = (detail) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
    }
    return 'Invalid email or password.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      const token = response.data.access_token;
      const user = response.data.user;

      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user_role', user.role); // Store role for easy access
        localStorage.setItem('user_id', user.id);
        
        navigate(from, { replace: true });
      } else {
        throw new Error('Login failed: Missing user data');
      }
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      setError(formatError(detail) || 'Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] py-12 px-6 relative overflow-hidden">
      {/* Behance-style Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-eco-gradient opacity-5 -z-10"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full space-y-10 bg-white/70 backdrop-blur-xl border border-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 relative z-10 animate-fade-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 text-white rounded-[2rem] mb-8 shadow-xl shadow-emerald-600/20 transform hover:rotate-12 transition-transform duration-500">
             <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-behance leading-tight">Welcome <br /> back.</h2>
          <p className="mt-4 text-gray-500 font-medium">Eco-conscious logistics start here.</p>       
        </div>

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-5 rounded-2xl text-xs font-bold flex items-start border animate-in slide-in-from-top-2 duration-300 ${authMessage && !loading ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-emerald-600 transition-colors">
                  <Mail className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-14 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-gray-200 group-hover:bg-white"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Secret Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-14 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-gray-200 group-hover:bg-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 px-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center shadow-2xl shadow-emerald-600/20 disabled:opacity-70 mt-4 group"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 font-medium pt-4">
            New to the platform?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-8 decoration-2 decoration-emerald-200 hover:decoration-emerald-500 transition-all">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );};

export default Login;
