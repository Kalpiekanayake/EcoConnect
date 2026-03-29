import { Link } from 'react-router-dom';
import { Leaf, Recycle, BarChart3, ShieldCheck, ArrowRight, Globe, Zap, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
  const categories = [
    { title: 'Plastic Waste', desc: 'Bottles, containers, and packaging materials.', icon: Recycle, color: 'bg-blue-50 text-blue-600' },
    { title: 'Paper & Cardboard', desc: 'Newspapers, office paper, and shipping boxes.', icon: Leaf, color: 'bg-green-50 text-green-600' },
    { title: 'Organic Waste', desc: 'Food scraps, yard waste, and biodegradable items.', icon: Globe, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Electronic Waste', desc: 'Old gadgets, batteries, and circuit boards.', icon: Zap, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-[#FCFAF7]"> {/* Soft Beige/Off-white background */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest mb-4">
              Eco-Friendly Solutions
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              Manage Your Waste, <span className="text-green-600">Save Our Planet.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Track your disposal habits, categorize your waste, and monitor your environmental footprint with our smart management system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1 flex items-center justify-center"
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* Category Preview Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Track All Waste Types</h2>
            <p className="text-gray-500 mt-4">Categorize your waste for better recycling and disposal tracking.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <div key={idx} className="group p-8 rounded-3xl border border-gray-100 bg-[#FCFAF7] hover:bg-white hover:shadow-xl hover:border-green-100 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{cat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-600 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-green-200">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">How it works?</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">Create an Account</h4>
                      <p className="text-green-50 opacity-80">Sign up in seconds and get your personal dashboard ready.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">Log Your Waste</h4>
                      <p className="text-green-50 opacity-80">Record type, description and category for every disposal.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">Track Progress</h4>
                      <p className="text-green-50 opacity-80">View your history and see how much you're helping the planet.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="bg-white/10 p-10 rounded-full backdrop-blur-sm border border-white/20 animate-pulse">
                  <Trash2 className="h-40 w-40 text-white" />
                </div>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
               <div className="w-96 h-96 border-[40px] border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">WasteManager</span>
          </div>
          <p className="text-gray-400 text-sm mb-8 italic">"Making the world cleaner, one record at a time."</p>
          <div className="flex justify-center space-x-6 text-gray-400 text-sm font-medium mb-8">
            <a href="#" className="hover:text-green-600 transition-colors">About Us</a>
            <a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-green-600 transition-colors">Contact</a>
          </div>
          <p className="text-gray-300 text-xs">© 2026 WasteManager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
