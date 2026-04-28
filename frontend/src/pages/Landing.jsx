import { Link } from 'react-router-dom';
import { Leaf, Truck, Calendar, ShieldCheck, ArrowRight, MapPin, Recycle, DollarSign, Search, CheckCircle, Users, Globe, BarChart3, Package, Sprout, Award, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import API from '../services/api';

// --- Category Visual Mapping ---
const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { icon: '🥥' },
    'Coconut Husks': { icon: '🌴' },
    'Plastic': { icon: '🥤' },
    'Glass': { icon: '🍾' },
    'Paper/Cardboard': { icon: '📦' },
    'Food Waste': { icon: '🍎' },
    'General Disposal': { icon: '🗑️' },
  };
  return styles[name] || { icon: '♻️' };
};

const Landing = () => {
  const [categories, setCategories] = useState([]);
  const [wastes, setWastes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, wasteRes] = await Promise.all([
          API.get('/categories'),
          API.get('/wastes')
        ]);
        setCategories(catRes.data);
        setWastes(wasteRes.data);
      } catch (err) {
        console.error("Failed to fetch landing page data", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-off-white font-sans selection:bg-primary/10 selection:text-primary">
      <Navbar />
      
      {/* Hero Section - Clean Corporate Aesthetic */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-hero-gradient"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-soft-mint/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/5 blur-3xl rounded-full translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-border-light text-primary text-xs font-bold uppercase tracking-widest mb-8">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Leading Waste Management in Sri Lanka
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-dark-slate leading-[1.1] mb-8 tracking-tight">
                Sustainable <br />
                <span className="text-primary italic">Solutions</span> for <br />
                Eco-Conscious Living.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-gray max-w-xl mb-12 leading-relaxed">
                EcoConnect is the professional bridge between modern households and certified waste collectors, optimizing resource recovery through technology.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Link to="/register" className="btn-primary w-full sm:w-auto text-lg py-5 px-10 shadow-corporate-lg">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/browse-requests" className="btn-secondary w-full sm:w-auto text-lg py-5 px-10">
                  Browse Requests
                </Link>
              </div>

              <div className="mt-16 flex flex-wrap items-center gap-8 opacity-60">
                 <div className="flex items-center gap-2 font-bold text-dark-slate text-sm"><Award className="w-5 h-5 text-primary" /> Verified Standards</div>
                 <div className="flex items-center gap-2 font-bold text-dark-slate text-sm"><ShieldCheck className="w-5 h-5 text-primary" /> Secure Platform</div>
                 <div className="flex items-center gap-2 font-bold text-dark-slate text-sm"><TrendingUp className="w-5 h-5 text-primary" /> Circular Economy</div>
              </div>
            </div>

            <div className="hidden lg:block relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-corporate-xl border-[12px] border-white">
                <img 
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1000" 
                  alt="Professional Waste Management" 
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                <div className="absolute bottom-8 left-8 right-8 glass p-8 rounded-3xl border border-white/20">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Sprout className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-dark-slate font-extrabold text-2xl tracking-tight">Eco Impact</p>
                        <p className="text-muted-gray font-medium">Empowering local communities today.</p>
                      </div>
                   </div>
                </div>
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-12 -left-12 grid grid-cols-4 gap-4 opacity-20">
                {[...Array(16)].map((_, i) => <div key={i} className="w-2 h-2 bg-primary rounded-full"></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats - Professional Report Style */}
      <section className="py-24 bg-white border-y border-border-light relative overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
             {[
               { icon: <Package className="w-5 h-5" />, value: wastes.length, label: "Total Listings", desc: "Requests documented" },
               { icon: <CheckCircle className="w-5 h-5" />, value: wastes.filter(w => w.status === 'COLLECTED').length, label: "Completed Jobs", desc: "Verified collections" },
               { icon: <Recycle className="w-5 h-5" />, value: categories.length, label: "Material Streams", desc: "Diverse waste types" },
               { icon: <Users className="w-5 h-5" />, value: "24/7", label: "Availability", desc: "Island-wide service" }
             ].map((stat, i) => (
               <div key={i} className="relative pl-8 md:pl-0">
                  <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-px bg-border-light"></div>
                  <div className="flex items-center gap-3 text-primary mb-4 font-bold text-xs uppercase tracking-widest">
                    {stat.icon} {stat.label}
                  </div>
                  <h4 className="text-5xl font-extrabold text-dark-slate mb-2 tracking-tighter">
                    {stat.value}
                  </h4>
                  <p className="text-muted-gray font-medium text-sm">{stat.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* How It Works - Clean Service Steps */}
      <section className="section-padding bg-off-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-6">Service Excellence</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-dark-slate leading-tight tracking-tight">Modernizing the way we <br /> handle waste in Sri Lanka.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                step: "01",
                title: "Digital Listing", 
                desc: "Describe your recyclables, set your location, and specify availability through our intuitive portal.",
                icon: <Package className="w-8 h-8" />
              },
              { 
                step: "02",
                title: "Collector Matching", 
                desc: "Our ecosystem notifies specialized collectors in your area who meet your specific waste stream needs.",
                icon: <Truck className="w-8 h-8" />
              },
              { 
                step: "03",
                title: "Impact Tracking", 
                desc: "Secure pickup confirmation and detailed reporting on your contribution to environmental sustainability.",
                icon: <ShieldCheck className="w-8 h-8" />
              }
            ].map((item, i) => (
              <div key={i} className="group p-10 bg-white rounded-[2.5rem] border border-border-light shadow-sm hover:shadow-corporate-lg transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-8 right-10 text-6xl font-black text-primary/5 group-hover:text-primary/10 transition-colors">{item.step}</div>
                <div className="w-16 h-16 bg-soft-mint text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <h4 className="text-2xl font-extrabold text-dark-slate mb-4 tracking-tight">{item.title}</h4>
                <p className="text-muted-gray font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Professional Service Cards */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-6">Material Streams</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-dark-slate tracking-tight">Comprehensive collection for <br /> every waste category.</h3>
            </div>
            <Link to="/browse-requests" className="btn-secondary">
              Explore All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.length > 0 ? categories.map((item, i) => {
              const count = wastes.filter(w => w.category_id === item.id && w.status === 'OPEN').length;
              const style = getCategoryStyles(item.name);
              return (
                <Link key={i} to={`/browse-requests/${item.id}`} className="group p-6 rounded-3xl bg-off-white border border-border-light hover:bg-white hover:shadow-corporate hover:border-primary/20 transition-all duration-500 text-center">
                  <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">{style.icon}</div>
                  <h4 className="font-extrabold text-dark-slate text-xs mb-3 uppercase tracking-wider group-hover:text-primary transition-colors leading-tight">{item.name}</h4>
                  <span className="inline-block py-1 px-3 bg-white border border-border-light rounded-full text-[10px] font-bold text-muted-gray group-hover:text-primary group-hover:border-primary/20 transition-colors">
                    {count} Active
                  </span>
                </Link>
              );
            }) : (
              <div className="col-span-full py-20 text-center">
                <div className="animate-spin text-primary mx-auto mb-4"><Recycle className="w-8 h-8" /></div>
                <p className="text-muted-gray font-bold tracking-widest text-xs uppercase">Initializing Categories...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA - Premium Action Section */}
      <section className="pb-32 container-custom">
        <div className="bg-corporate-gradient rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-corporate-xl">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-[1.15] tracking-tight">
              Join the future of Sri Lankan <br /> Waste Management.
            </h2>
            <p className="text-xl text-soft-mint/80 mb-12 max-w-2xl mx-auto font-medium">
              Start making a professional impact today. Join thousands of households and businesses already integrated into the EcoConnect platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto px-12 py-5 bg-white text-primary font-bold rounded-full hover:bg-soft-mint transition-all shadow-xl active:scale-95 text-lg">
                Create Account
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-12 py-5 bg-primary-dark/30 border border-white/20 text-white font-bold rounded-full hover:bg-primary-dark/50 transition-all active:scale-95 text-lg">
                Member Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-border-light bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <Leaf className="w-5 h-5 fill-current" />
                </div>
                <span className="text-2xl font-black text-dark-slate tracking-tighter">EcoConnect</span>
              </Link>
              <p className="text-muted-gray text-sm font-medium max-w-xs leading-relaxed">
                Professionalizing waste management ecosystems through digital connectivity and sustainable practices.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-dark-slate uppercase tracking-[0.2em]">Platform</p>
                <Link to="/browse-requests" className="block text-sm font-medium text-muted-gray hover:text-primary transition-colors">Browse Marketplace</Link>
                <Link to="/available-pickups" className="block text-sm font-medium text-muted-gray hover:text-primary transition-colors">Available Jobs</Link>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-dark-slate uppercase tracking-[0.2em]">Company</p>
                <Link to="/" className="block text-sm font-medium text-muted-gray hover:text-primary transition-colors">About Us</Link>
                <Link to="/" className="block text-sm font-medium text-muted-gray hover:text-primary transition-colors">Sustainability</Link>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-dark-slate uppercase tracking-[0.2em]">Account</p>
                <Link to="/login" className="block text-sm font-medium text-muted-gray hover:text-primary transition-colors">Log In</Link>
                <Link to="/register" className="block text-sm font-medium text-muted-gray hover:text-primary transition-colors">Get Started</Link>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-border-light flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">© 2026 EcoConnect Platform • Colombo, Sri Lanka</p>
            <div className="flex gap-6">
              <span className="text-[10px] font-bold text-muted-gray hover:text-primary cursor-pointer transition-colors uppercase tracking-widest">Privacy Policy</span>
              <span className="text-[10px] font-bold text-muted-gray hover:text-primary cursor-pointer transition-colors uppercase tracking-widest">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

