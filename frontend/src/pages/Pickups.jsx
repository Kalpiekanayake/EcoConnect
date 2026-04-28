import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Truck, Loader2, AlertCircle, Tag, Calendar, FileText, MapPin, Clock, DollarSign, Lock, CheckCircle2, Eye, Package, PlusCircle, ArrowRight } from 'lucide-react';

// --- Category Visual Mapping ---
const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { icon: '🥥', color: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700' },
    'Coconut Husks': { icon: '🌴', color: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
    'Plastic': { icon: '🥤', color: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
    'Glass': { icon: '🍾', color: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
    'Paper/Cardboard': { icon: '📦', color: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
    'Food Waste': { icon: '🍎', color: 'bg-red-50', border: 'border-red-100', text: 'text-red-700' },
    'General Disposal': { icon: '🗑️', color: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700' },
  };
  return styles[name] || { icon: '♻️', color: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' };
};

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.allSettled([
        API.get('/wastes?status=OPEN'),
        API.get('/categories')
      ]);
      
      if (responses[0].status === 'fulfilled') {
        setPickups(responses[0].value.data);
      }
      if (responses[1].status === 'fulfilled') {
        setCategories(responses[1].value.data);
      }
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (token) {
        API.get('/auth/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, [token]);

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Unknown';
  };

  const handleBookPickup = async (id) => {
    if (!token) {
        navigate('/login', { state: { from: { pathname: '/available-pickups' }, message: 'Please login as a Collector to book pickups.' } });
        return;
    }
    if (currentUser?.role !== 'COLLECTOR') {
        setError("Only registered Collectors can book pickups.");
        return;
    }
    try {
        await API.patch(`/wastes/${id}/book`);
        setSuccess("Pickup booked successfully! You can find it in 'My Bookings'.");
        setPickups(pickups.filter(p => p.id !== id));
    } catch (err) {
        setError(err.response?.data?.detail || "Failed to book pickup.");
    }
  };

  const openDetails = (pickup) => {
    setSelectedRequest(pickup);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-off-white">
            <Navbar />
            <main className="max-w-7xl mx-auto py-16 px-6 pt-32">
                <div className="mb-12">
                    <div className="h-12 w-64 bg-gray-100 rounded-xl animate-pulse mb-4"></div>
                    <div className="h-6 w-80 bg-gray-50 rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-white rounded-[3rem] border border-gray-100 animate-pulse shadow-sm"></div>)}
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-16 px-6 sm:px-8 pt-32">
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div>
            <h1 className="text-5xl font-extrabold text-dark-slate tracking-behance leading-tight">Available Pickups</h1>
            <p className="mt-3 text-lg text-muted-gray font-medium">Claim active collection tasks and optimize your eco-route.</p>
          </div>
          <div className="bg-primary text-white px-10 py-5 rounded-[2.5rem] border border-deep-forest hidden sm:block shadow-2xl shadow-primary/20 text-center min-w-[160px] hover:scale-105 transition-transform duration-500">
            <p className="text-[10px] text-soft-mint font-bold uppercase tracking-[0.3em] mb-1">Live Feed</p>
            <p className="text-4xl font-extrabold tracking-behance">{pickups.length}</p>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
          {success && (
            <div className="bg-primary text-white p-5 rounded-2xl shadow-2xl flex items-center border border-white/20 backdrop-blur-md animate-toast-in">
              <CheckCircle2 className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-white/20 backdrop-blur-md animate-toast-in">
              <AlertCircle className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {pickups.length === 0 ? (
          <div className="bg-white rounded-[4rem] border-4 border-dashed border-gray-100 py-40 text-center shadow-sm animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100/50">
               <Truck className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-3xl font-extrabold text-dark-slate tracking-behance">All Caught Up!</h3>
            <p className="text-muted-gray font-medium mt-3 max-w-sm mx-auto leading-relaxed">No new pickups in your area at the moment. We'll notify you when new tasks appear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {pickups.map((pickup) => {
              const catName = getCategoryName(pickup.category_id);
              const style = getCategoryStyles(catName);
              return (
                <div key={pickup.id} className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group flex flex-col h-full hover:border-primary/20 hover:-translate-y-2">
                  <div className="flex justify-between items-start mb-10">
                    <span className={`flex items-center gap-3 ${style.color} ${style.text} px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border ${style.border}/50 shadow-inner group-hover:scale-105 transition-transform`}>
                      <span className="text-2xl">{style.icon}</span> {catName}
                    </span>
                    {pickup.is_sellable ? (
                      <div className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center shadow-lg shadow-primary/20">
                          <DollarSign className="w-3.5 h-3.5 mr-1" /> SELLABLE
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-muted-gray px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center">
                          FREE
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-8 mb-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 text-dark-slate text-sm font-bold bg-off-white p-5 rounded-[2rem] border border-gray-100 shadow-inner group-hover:bg-white transition-colors">
                          <Package className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                          {pickup.quantity} {pickup.unit || 'kg'}
                        </div>
                        {pickup.is_sellable && (
                          <div className="flex items-center gap-2 text-primary text-sm font-extrabold bg-soft-mint p-5 rounded-[2rem] border border-primary/20 shadow-sm group-hover:shadow-md transition-all">
                            <DollarSign className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            Rs. {pickup.price || 0}
                          </div>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 text-muted-gray text-sm font-bold bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50 group-hover:bg-white transition-colors">
                           <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                           <span>{pickup.pickup_date}</span>
                           <span className="opacity-20 text-muted-gray">|</span>
                           <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                           <span>{pickup.time_slot}</span>
                       </div>
                       
                       <div className="flex items-start gap-4 text-muted-gray text-sm font-bold bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50 group-hover:bg-white transition-colors">
                           <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                           <span className="leading-relaxed line-clamp-2">{pickup.address_line}</span>
                       </div>
                    </div>

                    <div className="p-8 bg-gray-50/30 rounded-[2.5rem] min-h-[110px] border border-gray-100/50 group-hover:bg-white transition-colors shadow-inner">
                        <p className="text-muted-gray text-sm font-semibold leading-relaxed italic line-clamp-3 group-hover:text-dark-slate transition-colors">
                          "{pickup.description || 'No additional details provided.'}"
                        </p>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <button 
                      onClick={() => openDetails(pickup)}
                      className="flex items-center gap-2 text-[10px] font-bold text-muted-gray hover:text-primary uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                      <Eye className="w-5 h-5" /> Details
                    </button>
                    
                    <button 
                      onClick={() => handleBookPickup(pickup.id)}
                      className="px-10 py-4.5 bg-dark-slate text-white font-bold text-sm rounded-xl hover:bg-primary transition-all flex items-center gap-3 active:scale-90 shadow-xl shadow-gray-200"
                    >
                      {token && currentUser?.role === 'COLLECTOR' ? 'Claim Job' : <><Lock className="w-4 h-4" /> Login</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Guest CTA */}
        {!token && (
            <div className="mt-32 bg-dark-slate rounded-[4rem] p-20 md:p-32 text-center text-white relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="absolute inset-0 bg-eco-gradient opacity-10"></div>
                <div className="relative z-10">
                    <h2 className="text-5xl font-extrabold mb-8 tracking-behance leading-tight">Professional <br /> Waste Collection</h2>
                    <p className="text-soft-mint/60 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">Join our certified network. Access premium collection routes, track your environmental impact, and get paid for quality recyclables.</p>
                    <Link to="/register" className="inline-flex px-14 py-6 bg-primary text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30 text-lg">
                        Start Collecting
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
        )}
      </main>

      <RequestDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        categories={categories}
      />
    </div>
  );
};

export default Pickups;
