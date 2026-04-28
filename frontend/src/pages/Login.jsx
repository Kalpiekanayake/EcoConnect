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
    <div className="min-h-screen flex items-center justify-center bg-off-white py-12 px-6 relative overflow-hidden">
      {/* Behance-style Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-eco-gradient opacity-5 -z-10"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-deep-forest/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full space-y-10 bg-white/70 backdrop-blur-xl border border-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 relative z-10 animate-fade-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary text-white rounded-[2rem] mb-8 shadow-xl shadow-primary/20 transform hover:rotate-12 transition-transform duration-500">
             <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-dark-slate tracking-behance leading-tight">Welcome <br /> back.</h2>
          <p className="mt-4 text-muted-gray font-medium">Eco-conscious logistics start here.</p>       
        </div>

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-5 rounded-2xl text-xs font-bold flex items-start border animate-in slide-in-from-top-2 duration-300 ${authMessage && !loading ? 'bg-soft-mint text-primary border-primary/20' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] ml-2 mb-3 block">Identity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5 text-muted-gray/60" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-14 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-muted-gray/40 group-hover:bg-white"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] ml-2 mb-3 block">Secret Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5 text-muted-gray/60" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-14 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-muted-gray/40 group-hover:bg-white"
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
            className="w-full py-6 px-4 bg-primary text-white font-bold rounded-2xl hover:bg-deep-forest active:scale-95 transition-all flex items-center justify-center shadow-2xl shadow-primary/20 disabled:opacity-70 mt-4 group"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            )}
          </button>

          <p className="text-center text-sm text-muted-gray font-medium pt-4">
            New to the platform?{' '}
            <Link to="/register" className="text-primary hover:text-deep-forest font-bold underline underline-offset-8 decoration-2 decoration-primary/20 hover:decoration-primary transition-all">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );};

export default Login;
