import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] py-12 px-4">
      <div className="max-w-md w-full space-y-10 bg-white p-10 md:p-12 rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 shadow-sm border border-emerald-100/50">
             <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="mt-3 text-sm text-gray-500 font-medium">Continue your journey with EcoConnect</p>   
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-start border ${authMessage && !loading ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>        
              <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50 text-sm font-semibold placeholder:text-gray-300"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50 text-sm font-semibold placeholder:text-gray-300"
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
            className="w-full py-4 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center shadow-xl shadow-emerald-100 disabled:opacity-70 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              'Sign In to Account'
            )}
          </button>

          <p className="text-center text-sm text-gray-500 font-medium pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 decoration-2">
              Join for free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
