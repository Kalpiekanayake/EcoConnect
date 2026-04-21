import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Truck, Loader2, AlertCircle, Tag, Calendar, FileText, MapPin, Clock, DollarSign, Lock, CheckCircle2 } from 'lucide-react';

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
    if (token) {
        API.get('/auth/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, [token]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [wasteRes, catRes] = await Promise.all([
        API.get('/wastes'),
        API.get('/categories')
      ]);
      // For this "Pickups" view, we primarily want to show OPEN requests 
      // that collectors can actually book.
      setPickups(wasteRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError('Failed to fetch pickups.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        // This assumes a backend route like PUT /wastes/{id} with status update exists
        // Since we haven't implemented the booking logic on backend yet, we simulate
        // or use the existing update route if allowed.
        setSuccess("Booking feature coming soon! (Backend route required)");
    } catch (err) {
        setError("Failed to book pickup.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Available Pickups</h1>
            <p className="mt-2 text-gray-500 font-medium">Find and book waste collection requests in your vicinity.</p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 hidden sm:block">
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1 text-center">Open Jobs</p>
            <p className="text-2xl font-black text-emerald-700 text-center">
                {pickups.filter(p => p.status === 'OPEN').length}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-50 space-y-2 max-w-sm w-full">
          {success && (
            <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center animate-bounce-in border-b-4 border-emerald-800">
              <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center animate-bounce-in border-b-4 border-red-800">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-400 font-bold">Scanning for pickups...</p>
          </div>
        ) : pickups.filter(p => p.status === 'OPEN').length === 0 ? (
          <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-100 py-32 text-center">
            <Truck className="h-16 w-16 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900">No pickups available</h3>
            <p className="text-gray-400 font-medium mt-2">All requests have been booked or the area is currently clear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pickups.filter(p => p.status === 'OPEN').map((pickup) => (
              <div key={pickup.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    {getCategoryName(pickup.category_id)}
                  </span>
                  {pickup.is_sellable && (
                    <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" /> Sellable
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4 mb-8">
                   <div className="flex items-center gap-3 text-gray-400 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      {pickup.pickup_date} <span className="opacity-20">|</span> <Clock className="w-4 h-4 text-emerald-500" /> {pickup.time_slot}
                   </div>
                   
                   <div className="flex items-start gap-3 text-gray-400 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-tight">{pickup.address_line}</span>
                   </div>

                   <div className="p-4 bg-gray-50 rounded-2xl min-h-[80px]">
                      <p className="text-gray-500 text-sm font-medium leading-relaxed italic line-clamp-3">
                        "{pickup.description || 'No specific details provided.'}"
                      </p>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                   <div className="text-lg font-black text-gray-900">
                      {pickup.quantity} <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Units</span>
                   </div>
                   
                   <button 
                    onClick={() => handleBookPickup(pickup.id)}
                    className="px-6 py-3 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
                   >
                     {token && currentUser?.role === 'COLLECTOR' ? 'Book Now' : <><Lock className="w-3 h-3" /> Login to Book</>}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guest CTA */}
        {!token && (
            <div className="mt-20 bg-emerald-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-100">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-4">Are you a Waste Collector?</h2>
                    <p className="text-emerald-100 font-medium mb-8 max-w-lg mx-auto">Register as a collector to start booking these pickups and help keep our community clean while earning.</p>
                    <Link to="/register" className="inline-block px-10 py-4 bg-white text-emerald-900 font-black rounded-2xl hover:bg-emerald-50 transition-all">
                        Join as Collector
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            </div>
        )}
      </main>
    </div>
  );
};

export default Pickups;
