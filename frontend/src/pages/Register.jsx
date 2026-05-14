import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { User, Mail, Lock, Loader2, AlertCircle, Phone, MapPin, ArrowRight } from 'lucide-react';
import ecoLogo from '../assets/illustrations/eco-logo.png';

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
    <div className="min-h-screen flex items-center justify-center bg-off-white py-16 px-6 relative overflow-hidden">
      {/* Behance-style Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-eco-gradient opacity-5 -z-10"></div>
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-deep-forest/10 rounded-full blur-[100px]"></div>

      <div className="max-w-2xl w-full space-y-10 bg-white/70 backdrop-blur-xl border border-white p-10 md:p-14 rounded-[4rem] shadow-2xl shadow-gray-200/50 relative z-10 animate-fade-up">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3.5 mb-10 transform hover:scale-105 transition-transform duration-500">
             <img src={ecoLogo} alt="EcoConnect" className="h-12 w-auto object-contain" />
             <span className="text-3xl font-black tracking-tight flex items-center">
                <span className="text-primary">Eco</span>
                <span className="text-dark-slate">Connect</span>
             </span>
          </Link>
          <h2 className="text-4xl font-extrabold text-dark-slate tracking-behance leading-tight">Create <br /> Account.</h2>
          <p className="mt-4 text-muted-gray font-medium">Join the sustainable logistics network.</p>
        </div>

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-5 rounded-2xl text-xs font-bold flex items-start border border-red-100 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-8">
            {/* Role Selection */}
            <div className="bg-gray-50/50 p-2 rounded-2xl border border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'HOUSEHOLD' })}
                  className={`flex-1 py-4 rounded-xl font-bold text-xs transition-all ${
                    formData.role === 'HOUSEHOLD'
                    ? 'bg-white text-primary shadow-lg border border-gray-100'
                    : 'text-muted-gray hover:text-dark-slate'
                  }`}
                >
                  I am a Household
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'COLLECTOR' })}
                  className={`flex-1 py-4 rounded-xl font-bold text-xs transition-all ${
                    formData.role === 'COLLECTOR'
                    ? 'bg-white text-primary shadow-lg border border-gray-100'
                    : 'text-muted-gray hover:text-dark-slate'
                  }`}
                >
                  I am a Collector
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] ml-2 mb-3 block">Full Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <User className="h-5 w-5 text-muted-gray/60" />
                    </div>
                    <input
                    name="full_name"
                    type="text"
                    required
                    className="block w-full pl-14 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-muted-gray/40 group-hover:bg-white"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    />
                </div>
                </div>

                <div className="group">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] ml-2 mb-3 block">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Mail className="h-5 w-5 text-muted-gray/60" />
                    </div>
                    <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-14 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-muted-gray/40 group-hover:bg-white"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    />
                </div>
                </div>

                <div className="group">
                    <label className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] ml-2 mb-3 block">Phone</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">        
                        <Phone className="h-4 w-4 text-muted-gray/60" />
                    </div>
                    <input
                        name="phone"
                        type="text"
                        className="block w-full pl-12 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-muted-gray/40 group-hover:bg-white"
                        placeholder="0712345678"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    </div>
                </div>

                <div className="group">
                    <label className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] ml-2 mb-3 block">Address</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">        
                        <MapPin className="h-4 w-4 text-muted-gray/60" />
                    </div>
                    <input
                        name="address"
                        type="text"
                        className="block w-full pl-12 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-muted-gray/40 group-hover:bg-white"
                        placeholder="Street/City"
                        value={formData.address}
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

                <div className="group">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em] ml-2 mb-3 block">Verify Key</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5 text-muted-gray/60" />
                    </div>
                    <input
                    name="confirmPassword"
                    type="password"
                    required
                    className="block w-full pl-14 pr-6 py-5 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50/50 text-sm font-semibold placeholder:text-muted-gray/40 group-hover:bg-white"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    />
                </div>
                </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 px-4 bg-primary text-white font-bold rounded-2xl hover:bg-deep-forest active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 shadow-2xl shadow-primary/20 mt-6 group"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-6 w-6 mr-3" />
                Validating...
              </>
            ) : (
              <span className="flex items-center gap-2 text-lg">Create Free Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
            )}
          </button>

          <p className="text-center text-sm text-muted-gray font-medium pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-deep-forest font-bold underline underline-offset-8 decoration-2 decoration-primary/20 hover:decoration-primary transition-all">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
