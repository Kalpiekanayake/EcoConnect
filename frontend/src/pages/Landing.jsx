import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Truck, CheckCircle, Package, Sprout, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import API from '../services/api';
import heroBg from '../assets/illustrations/hero-bg.png';

// Category Images
import shellImg from '../assets/categories/coconut-shells.jpg';
import huskImg from '../assets/categories/coconut-husks.jpg';
import plasticImg from '../assets/categories/plastic.jpg';
import glassImg from '../assets/categories/glass.jpg';
import paperImg from '../assets/categories/paper.jpg';
import foodImg from '../assets/categories/food.jpg';
import generalImg from '../assets/categories/general.jpg';

const Landing = () => {
  const [categories, setCategories] = useState([]);
  const [wastes, setWastes] = useState([]);

  const categoryImageMap = {
    'Coconut Shells': shellImg,
    'Coconut Husks': huskImg,
    'Plastic': plasticImg,
    'Glass': glassImg,
    'Paper': paperImg,
    'Paper/Cardboard': paperImg,
    'Food Waste': foodImg,
    'General Disposal': generalImg,
  };

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
      
      {/* Hero Section - Clean SaaS Premium Cinematic Style */}
      <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden bg-slate-900">
        {/* Full-width Background Image with Refined Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Eco-tech smart waste management" 
            className="w-full h-full object-cover opacity-90 scale-100 transition-transform duration-1000"
          />
          {/* Softer Cinematic Overlays for Sharp Visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-slate-950/5"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-app-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-white text-[10px] font-black uppercase tracking-[0.25em] mb-12 backdrop-blur-md">
                <Sprout className="w-3.5 h-3.5 text-primary" /> EcoConnect Platform
              </div>
              
              <h1 className="text-6xl md:text-[5.5rem] font-black text-white leading-[0.9] tracking-tighter mb-10">
                Smart. <br />
                Connected. <br />
                <span className="text-primary">Sustainable.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-200 mb-14 max-w-xl font-medium leading-relaxed opacity-90">
                Bridging the gap between circular economy goals and real-world waste collection through intelligent eco logistics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/register" className="h-16 px-10 bg-primary text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all hover:-translate-y-1">
                  Request a Pickup <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/browse-requests" className="h-16 px-10 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl text-lg font-bold flex items-center justify-center hover:bg-white/20 transition-all hover:-translate-y-1">
                  View Marketplace
                </Link>
              </div>

              <div className="mt-20 flex flex-wrap items-center gap-x-12 gap-y-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Live Tracking
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <Package className="w-5 h-5 text-primary" /> Smart Analytics
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <Leaf className="w-5 h-5 text-primary" /> Eco Friendly
                  </div>
              </div>
            </div>

            {/* Right side left empty to showcase the cinematic background image */}
            <div className="hidden lg:block h-full min-h-[400px]">
                {/* No floating cards here to maintain a clean Sensoneo-style look */}
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
              <Link key={cat.id} to={`/browse-requests/${cat.id}`} className="flex flex-col group">
                 <div className="relative aspect-square rounded-3xl overflow-hidden border border-border-light shadow-sm mb-4 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1">
                    <img 
                      src={categoryImageMap[cat.name] || categoryImageMap['General Disposal']} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
                 <div className="text-center">
                    <h4 className="text-[10px] font-black text-dark-slate uppercase tracking-[0.15em] mb-1.5 leading-tight">{cat.name}</h4>
                    <span className="text-[9px] font-bold text-primary bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                 </div>
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
