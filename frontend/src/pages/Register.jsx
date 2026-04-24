import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { User, Mail, Lock, Loader2, AlertCircle, Phone, MapPin, Users } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'HOUSEHOLD' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatError = (detail) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
    }
    return 'Registration failed. Please check your data.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await API.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: formData.role
      });
      // Redirect to login after successful registration
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
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
             <Users className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
          <p className="mt-3 text-sm text-gray-500 font-medium">Join the EcoConnect community today</p> 
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold flex items-start border border-red-100">
              <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 mb-3 block text-center">I want to be a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'HOUSEHOLD' })}
                  className={`py-3.5 rounded-xl font-bold text-xs transition-all border-2 ${
                    formData.role === 'HOUSEHOLD'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100'
                    : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  Household
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'COLLECTOR' })}
                  className={`py-3.5 rounded-xl font-bold text-xs transition-all border-2 ${
                    formData.role === 'COLLECTOR'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100'
                    : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  Collector
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="full_name"
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50 text-sm font-semibold placeholder:text-gray-300"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">        
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="phone"
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50 text-sm font-semibold placeholder:text-gray-300"
                    placeholder="0712345678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">        
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="address"
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50 text-sm font-semibold placeholder:text-gray-300"
                    placeholder="Street/City"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
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

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50 text-sm font-semibold placeholder:text-gray-300"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 shadow-xl shadow-emerald-100 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              'Create Free Account'
            )}
          </button>

          <p className="text-center text-sm text-gray-500 font-medium pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 decoration-2">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
