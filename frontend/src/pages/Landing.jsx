import { Link } from 'react-router-dom';
import { Leaf, Truck, Calendar, ShieldCheck, ArrowRight, MapPin, Recycle, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest mb-8 border border-emerald-100">
            <Leaf className="w-3.5 h-3.5" /> Smarter Waste Logistics
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8">
            Connecting Households <br />
            <span className="text-emerald-600 italic">to Local Collectors.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop waiting for collectors who never show up. Post your available times, 
            and let verified collectors book a pickup when you're actually home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all hover:scale-105 flex items-center justify-center gap-2">
              Start Booking Now <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Trusted by 500+ Local Communities
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">Set Your Time</h3>
              <p className="text-gray-500 leading-relaxed">Tell us when you're home. No more missed pickups or waste sitting on the curb for days.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:-rotate-6 transition-transform">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">Verified Collectors</h3>
              <p className="text-gray-500 leading-relaxed">Only verified professional collectors can browse and book your requests.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">Sell Recyclables</h3>
              <p className="text-gray-500 leading-relaxed">Earn money for sellable items like coconut shells, plastic, and glass bottles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black text-gray-900 mb-4">What can we collect?</h2>
              <p className="text-gray-500 font-bold">From daily food waste to valuable recyclables.</p>
            </div>
            <div className="flex gap-4">
               <span className="px-4 py-2 bg-white rounded-full border border-gray-100 text-xs font-black text-emerald-600 uppercase tracking-widest shadow-sm">Sellable</span>
               <span className="px-4 py-2 bg-white rounded-full border border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest shadow-sm">Disposal</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Coconut Shells', icon: '🥥', color: 'bg-orange-50' },
              { name: 'Recyclable Plastic', icon: '🥤', color: 'bg-blue-50' },
              { name: 'Glass Bottles', icon: '🍾', color: 'bg-emerald-50' },
              { name: 'General Waste', icon: '🗑️', color: 'bg-gray-50' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} p-8 rounded-[2.5rem] text-center border border-white hover:shadow-xl transition-all group`}>
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{item.icon}</div>
                <h4 className="font-black text-gray-900">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
              Ready to simplify your <br />
              <span className="text-emerald-400">waste management?</span>
            </h2>
            <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 font-black rounded-2xl hover:bg-emerald-50 transition-all">
              Join the Platform <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">© 2026 EcoConnect Platform</p>
      </footer>
    </div>
  );
};

export default Landing;
