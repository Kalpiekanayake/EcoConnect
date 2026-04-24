import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Truck, Loader2, AlertCircle, Tag, Calendar, FileText, MapPin, Clock, DollarSign, Lock, CheckCircle2, Eye, Package } from 'lucide-react';

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
      } else {
        console.error('Pickups fetch error:', responses[0].reason);
      }

      if (responses[1].status === 'fulfilled') {
        setCategories(responses[1].value.data);
      }
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (token) {
        API.get('/auth/me')
          .then(res => setCurrentUser(res.data))
          .catch(err => {
            console.error('User fetch error:', err);
          });
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

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-16 px-4">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Available Pickups</h1>
            <p className="mt-2 text-lg text-gray-500 font-medium">Find and book waste collection requests in your vicinity.</p>
          </div>
          <div className="bg-emerald-50 px-8 py-4 rounded-[2rem] border border-emerald-100 hidden sm:block shadow-sm text-center min-w-[140px]">
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Open Jobs</p>
            <p className="text-3xl font-black text-emerald-700">{pickups.length}</p>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
          {success && (
            <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-emerald-500/50 backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
              <CheckCircle2 className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-red-500/50 backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
              <AlertCircle className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-400 font-bold">Scanning for pickups...</p>
          </div>
        ) : pickups.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-100 py-32 text-center shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100/50">
               <Truck className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">No pickups available</h3>
            <p className="text-gray-500 font-medium mt-2">All requests have been booked or the area is currently clear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pickups.map((pickup) => {
              const catName = getCategoryName(pickup.category_id);
              const style = getCategoryStyles(catName);
              return (
                <div key={pickup.id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group flex flex-col h-full hover:border-emerald-100">
                  <div className="flex justify-between items-start mb-8">
                    <span className={`flex items-center gap-2 ${style.color} ${style.text} px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${style.border}/50 shadow-sm`}>
                      <span className="text-xl">{style.icon}</span> {catName}
                    </span>
                    {pickup.is_sellable ? (
                      <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center shadow-sm shadow-emerald-100">
                          <DollarSign className="w-3.5 h-3.5 mr-1" /> SELLABLE
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center">
                          FREE PICKUP
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-6 mb-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-gray-900 text-xs font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                          <Package className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {pickup.quantity} {pickup.unit || 'kg'}
                        </div>
                        {pickup.is_sellable && (
                          <div className="flex items-center gap-2 text-emerald-700 text-xs font-black bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            Rs. {pickup.price || 0}
                          </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-500 text-xs font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700">{pickup.pickup_date}</span>
                        <span className="opacity-20 text-gray-400">|</span>
                        <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700">{pickup.time_slot}</span>
                    </div>
                    
                    <div className="flex items-start gap-4 text-gray-500 text-xs font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-normal line-clamp-2">{pickup.address_line}</span>
                    </div>

                    <div className="p-6 bg-gray-50/50 rounded-2xl min-h-[96px] border border-gray-100/50">
                        <p className="text-gray-600 text-sm font-semibold leading-relaxed italic line-clamp-3">
                          "{pickup.description || 'No additional details provided.'}"
                        </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <button 
                      onClick={() => openDetails(pickup)}
                      className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-all"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    
                    <button 
                      onClick={() => handleBookPickup(pickup.id)}
                      className="px-8 py-3.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-gray-200"
                    >
                      {token && currentUser?.role === 'COLLECTOR' ? 'Book Now' : <><Lock className="w-3.5 h-3.5" /> Login to Book</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Guest CTA */}
        {!token && (
            <div className="mt-24 bg-gray-900 rounded-[3rem] p-16 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-900/10">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black mb-6 tracking-tight">Are you a Waste Collector?</h2>
                    <p className="text-gray-400 text-lg font-medium mb-10 max-w-2xl mx-auto leading-relaxed">Join our professional network of collectors. Book pickups in advance, optimize your routes, and earn from recyclables.</p>
                    <Link to="/register" className="inline-flex px-12 py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-600/20">
                        Start Collecting Now
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
            </div>
        )}
      </main>

      <RequestDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        categories={categories}
      />

      <style>{`
        @keyframes bounce-in {
          0% { transform: translateY(-20px); opacity: 0; }
          60% { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Pickups;
