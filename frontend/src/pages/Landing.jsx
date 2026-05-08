import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Truck, CheckCircle, Package, Sprout, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import API from '../services/api';
import heroBg from '../assets/illustrations/hero-bg.png';

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
        console.error("Failed to fetch landing data", err);
      }
    };
    fetchData();
  }, []);

  // Filter completed tasks for real stats
  const completedPickups = wastes.filter(w => w.status === 'COLLECTED').length;
  const activeRequests = wastes.filter(w => w.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-bg-app font-sans">
      <Navbar />
      
      {/* Hero Section - SaaS Premium Cinematic Style */}
      <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden bg-slate-950">
        {/* Full-width Background Image with Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Eco-tech smart waste management" 
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          {/* Cinematic Overlays for Readability & Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-app-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-10 backdrop-blur-md">
                <Sprout className="w-3.5 h-3.5" /> Next-Gen Waste Logistics
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-10">
                Smart. <br />
                Connected. <br />
                <span className="text-primary">Sustainable.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-14 max-w-xl font-medium leading-relaxed">
                Bridging the gap between circular economy goals and real-world industrial recovery with intelligent data-driven logistics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/register" className="h-16 px-10 bg-primary text-white rounded-2xl text-lg font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all hover:-translate-y-1">
                  Launch Request <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/browse-requests" className="h-16 px-10 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl text-lg font-black flex items-center justify-center hover:bg-white/20 transition-all hover:-translate-y-1">
                  View Marketplace
                </Link>
              </div>

              <div className="mt-16 flex items-center gap-10">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Industrial Grade
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Truck className="w-5 h-5 text-primary" /> Real-time Tracking
                  </div>
              </div>
            </div>

            {/* Right side remains open to showcase the cinematic background */}
            <div className="hidden lg:block">
                {/* Subtle Floating Impact Card */}
                <div className="ml-auto w-fit bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl animate-float">
                   <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                         <Truck className="w-8 h-8" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Network Status</p>
                         <p className="text-2xl font-black text-white leading-none">{activeRequests} Active Nodes</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      {[1,2,3,4,5].map(i => (
                         <div key={i} className="h-1 w-8 bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                         </div>
                      ))}
                   </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 bg-white border-y border-border-light relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4">Material Streams</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-dark-slate tracking-tight">Our circular economy sectors.</h3>
            </div>
            <Link to="/browse-requests" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-2 group">
              Browse All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/browse-requests/${cat.id}`} className="card-3d p-6 flex flex-col items-center text-center group">
                 <div className="w-16 h-16 bg-bg-app rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
                    {cat.name.includes('Coconut Shells') ? '🥥' : 
                     cat.name.includes('Coconut Husks') ? '🌴' :
                     cat.name.includes('Plastic') ? '🥤' :
                     cat.name.includes('Glass') ? '🍾' :
                     cat.name.includes('Paper') ? '📦' :
                     cat.name.includes('Food') ? '🍎' : '🗑️'}
                 </div>
                 <h4 className="text-[10px] font-black text-dark-slate uppercase tracking-wider mb-2 leading-tight">{cat.name}</h4>
                 <span className="text-[9px] font-bold text-primary bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Real-time</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Real Impact Stats */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { label: "Documented Pickups", value: wastes.length, icon: <Package className="w-5 h-5" /> },
               { label: "Verified Completed", value: completedPickups, icon: <CheckCircle className="w-5 h-5" /> },
               { label: "Active Network Jobs", value: activeRequests, icon: <Truck className="w-5 h-5" /> }
             ].map((stat, i) => (
               <div key={i} className="p-10 rounded-3xl bg-white border border-border-light shadow-3d group hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 bg-bg-app rounded-xl flex items-center justify-center text-primary mb-8 transition-all group-hover:bg-primary group-hover:text-white">
                    {stat.icon}
                  </div>
                  <h4 className="text-5xl font-extrabold text-dark-slate mb-3 tracking-tighter leading-none">
                    {stat.value}
                  </h4>
                  <p className="text-muted-gray font-bold text-[11px] uppercase tracking-widest">{stat.label}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-white border-t border-border-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-3d">
              <Leaf className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-extrabold text-dark-slate tracking-tighter">EcoConnect</span>
          </div>
          <div className="flex gap-10 text-[11px] font-bold text-muted-gray uppercase tracking-widest">
             <span className="hover:text-primary cursor-pointer transition-colors">Marketplace</span>
             <span className="hover:text-primary cursor-pointer transition-colors">Network</span>
             <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
          </div>
          <p className="text-[10px] font-bold text-muted-gray/50 uppercase tracking-[0.2em]">© 2026 Colombo Operations</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
