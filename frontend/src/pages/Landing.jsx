import { Link } from 'react-router-dom';
import { Leaf, Truck, Calendar, ShieldCheck, ArrowRight, MapPin, Recycle, DollarSign, Search } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 border border-emerald-100 shadow-sm">
            <Leaf className="w-3.5 h-3.5" /> Smarter Waste Logistics
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[1.05] mb-10 tracking-tight">
            Connecting Households <br />
            <span className="text-emerald-600 italic">to Local Collectors.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Stop waiting for collectors who never show up. Post your available times, 
            and let verified collectors book a pickup when you're actually home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              Start Booking Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/browse-requests" className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
              <Search className="w-5 h-5 text-emerald-600" /> Explore Requests
            </Link>
          </div>
          <div className="mt-16 flex items-center justify-center gap-3 text-sm font-semibold text-gray-400">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Trusted by 500+ Local Communities
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Set Your Time</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Tell us when you're home. No more missed pickups or waste sitting on the curb for days.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Collectors</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Only verified professional collectors can browse and book your requests.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sell Recyclables</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Earn money for sellable items like coconut shells, plastic, and glass bottles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl text-left">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">What can we collect?</h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">From daily food waste to valuable recyclables. We handle everything with care.</p>
            </div>
            <div className="flex gap-4">
               <span className="px-5 py-2.5 bg-white rounded-xl border border-gray-200 text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm">Sellable</span>
               <span className="px-5 py-2.5 bg-white rounded-xl border border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">Disposal</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Coconut Shells', icon: '🥥', color: 'bg-white' },
              { name: 'Coconut Husks', icon: '🌴', color: 'bg-white' },
              { name: 'Recyclable Plastic', icon: '🥤', color: 'bg-white' },
              { name: 'Glass Bottles', icon: '🍾', color: 'bg-white' },
              { name: 'General Waste', icon: '🗑️', color: 'bg-white' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} p-10 rounded-3xl text-center border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group`}>
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-emerald-900/10">
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-10 leading-tight tracking-tight">
              Ready to simplify your <br />
              <span className="text-emerald-400">waste management?</span>
            </h2>
            <Link to="/register" className="inline-flex items-center gap-3 px-12 py-6 bg-white text-gray-900 font-bold rounded-2xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
              Join the Platform <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center bg-white">
        <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">© 2026 EcoConnect Platform</p>
      </footer>
    </div>
  );
};

export default Landing;
