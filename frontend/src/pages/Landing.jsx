import { Link } from 'react-router-dom';
import { Leaf, Truck, Calendar, ShieldCheck, ArrowRight, MapPin, Recycle, DollarSign, Search, CheckCircle, Users, Globe, BarChart3, Package } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      
      {/* Hero Section - Behance Style */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-40 pb-20 bg-off-white">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-soft-mint/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-soft-mint border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-10 animate-fade-up shadow-sm">
            <Leaf className="w-3.5 h-3.5" /> Eco-Conscious Logistics
          </div>
          
          <h1 className="text-6xl md:text-[110px] font-black text-dark-slate leading-[0.95] mb-12 tracking-behance animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Future of <br />
            <span className="text-primary italic">Waste Management.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-gray max-w-3xl mx-auto mb-16 leading-relaxed font-medium animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Empowering communities to turn waste into resources. Connect directly with local collectors for seamless, verified pickups.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-primary text-white font-bold rounded-2xl hover:bg-deep-forest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 text-lg">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/browse-requests" className="w-full sm:w-auto px-12 py-6 bg-white text-dark-slate font-bold rounded-2xl border border-gray-100 hover:border-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg shadow-sm">
              Explore Community
            </Link>
          </div>
          
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
             {[
               { icon: <Users />, label: "5k+ Users" },
               { icon: <Globe />, label: "12 Cities" },
               { icon: <Recycle />, label: "500 Tons Recycled" },
               { icon: <ShieldCheck />, label: "100% Verified" }
             ].map((stat, i) => (
               <div key={i} className="flex flex-col items-center gap-3 text-muted-gray">
                  <div className="p-3 bg-soft-mint rounded-xl border border-primary/10 text-primary">{stat.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 relative overflow-hidden bg-off-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.4em] mb-6">Process</h2>
            <h3 className="text-4xl md:text-6xl font-black text-dark-slate tracking-behance leading-tight">Simple. Transparent. <br />Efficient.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: "01", 
                title: "Post Your Waste", 
                desc: "Describe what you have, set a preferred date, and share your location on our interactive map.",
                icon: <Package className="w-8 h-8" />
              },
              { 
                step: "02", 
                title: "Verified Claiming", 
                desc: "Professional collectors browse listings and claim requests that fit their routes and expertise.",
                icon: <Truck className="w-8 h-8" />
              },
              { 
                step: "03", 
                title: "Earn & Impact", 
                desc: "Get paid for recyclables and receive points for your contribution to a circular economy.",
                icon: <DollarSign className="w-8 h-8" />
              }
            ].map((item, i) => (
              <div key={i} className="group relative p-12 bg-white rounded-[3rem] border border-gray-100 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                <span className="text-[80px] font-black text-gray-50 absolute top-4 right-8 leading-none group-hover:text-soft-mint transition-colors">{item.step}</span>
                <div className="w-16 h-16 bg-soft-mint text-primary rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <h4 className="text-2xl font-bold text-dark-slate mb-4 relative z-10">{item.title}</h4>
                <p className="text-muted-gray font-medium leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-32 bg-soft-mint/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.4em] mb-6">Categories</h2>
              <h3 className="text-4xl md:text-6xl font-black text-dark-slate tracking-behance">We handle it with care.</h3>
            </div>
            <Link to="/browse-requests" className="px-8 py-4 bg-dark-slate text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center gap-3">
              Explore All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { name: 'Coconut Shells', icon: '🥥', count: '1.2k active' },
              { name: 'Organic Waste', icon: '🍃', count: '850 active' },
              { name: 'Recyclables', icon: '🥤', count: '3.4k active' },
              { name: 'Glassware', icon: '🍾', count: '420 active' },
              { name: 'Mixed Waste', icon: '🗑️', count: '2.1k active' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] text-center border border-white hover:border-soft-mint hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group">
                <div className="text-6xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{item.icon}</div>
                <h4 className="font-bold text-dark-slate mb-2">{item.name}</h4>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-32 px-6 bg-off-white">
        <div className="max-w-6xl mx-auto bg-dark-slate rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-eco-gradient opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-[80px] font-black text-white mb-12 leading-tight tracking-behance">
              Join the Circular <br />
              <span className="text-primary">Revolution.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-primary text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20">
                Register Now
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                Login to Platform
              </Link>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-[10px] font-bold text-gray-400 tracking-[0.4em] uppercase">© 2026 EcoConnect Platform • All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Landing;
