import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // The backend UserLogin schema expects { "email": "...", "password": "..." }
      const response = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Full login error:', err);
      // Capture the actual detail message from the 500 or 401 error
      const message = err.response?.data?.detail || 'Server error (500). Please check backend logs.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">Sign In</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Welcome back to EcoConnect</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm flex items-start border border-red-100">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-[#FAF9F6] text-sm font-bold"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-[#FAF9F6] text-sm font-bold"
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
            className="w-full py-4 px-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-emerald-100 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-500 font-bold">
            Don't have an account? <Link to="/register" className="text-emerald-600 underline">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
