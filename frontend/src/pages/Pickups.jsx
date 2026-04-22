import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Truck, Loader2, AlertCircle, Tag, Calendar, FileText, MapPin, Clock, DollarSign, Lock, CheckCircle2, Eye } from 'lucide-react';

const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      // Fetch only OPEN requests for this view
      const [wasteRes, catRes] = await Promise.all([
        API.get('/wastes?status=OPEN'),
        API.get('/categories')
      ]);
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
        await API.patch(`/wastes/${id}/book`);
        setSuccess("Pickup booked successfully! You can find it in 'My Bookings'.");
        // Remove the booked pickup from the list
        setPickups(pickups.filter(p => p.id !== id));
    } catch (err) {
        setError(err.response?.data?.detail || "Failed to book pickup.");
    }
  };

  const openDetails = (pickup) => {
    setSelectedRequest(pickup);
    setIsModalOpen(true);
  };

  // Filtering Logic
  const filteredPickups = selectedCategory === 'All' 
    ? pickups 
    : pickups.filter(p => getCategoryName(p.category_id) === selectedCategory);

  const getCountForCategory = (catName) => {
    if (catName === 'All') return pickups.length;
    return pickups.filter(p => getCategoryName(p.category_id) === catName).length;
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Available Pickups</h1>
            <p className="mt-2 text-gray-500 font-medium">Find and book waste collection requests in your vicinity.</p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm text-center min-w-[120px]">
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Matching Jobs</p>
            <p className="text-2xl font-black text-emerald-700">
                {filteredPickups.length}
            </p>
          </div>
        </div>

        {/* Category Filter Boxes */}
        <div className="mb-12 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-w-[600px] md:min-w-0">
                {/* All Requests Card */}
                <button
                    onClick={() => setSelectedCategory('All')}
                    className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between h-36 active:scale-95 group relative overflow-hidden ${
                        selectedCategory === 'All' 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                    }`}
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div className={`p-2.5 rounded-xl ${selectedCategory === 'All' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                            <Truck className="w-5 h-5" />
                        </div>
                        <span className={`text-xl font-black ${selectedCategory === 'All' ? 'text-white' : 'text-gray-900'}`}>
                            {pickups.length}
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Browse</p>
                        <h3 className={`text-sm font-black leading-tight ${selectedCategory === 'All' ? 'text-white' : 'text-gray-900'}`}>
                            All Categories
                        </h3>
                    </div>
                    {selectedCategory === 'All' && (
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                    )}
                </button>

                {/* Individual Category Cards */}
                {categories.map((cat) => {
                    const count = getCountForCategory(cat.name);
                    const isActive = selectedCategory === cat.name;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between h-36 active:scale-95 group relative overflow-hidden ${
                                isActive 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                            }`}
                        >
                            <div className="flex justify-between items-start relative z-10">
                                <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className={`text-xl font-black ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                    {count}
                                </span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Category</p>
                                <h3 className={`text-sm font-black leading-tight ${isActive ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                                    {cat.name}
                                </h3>
                            </div>
                            {isActive && (
                                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                            )}
                        </button>
                    );
                })}
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
        ) : filteredPickups.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-100 py-32 text-center shadow-sm">
            <Truck className="h-16 w-16 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900">No pickups available</h3>
            <p className="text-gray-400 font-medium mt-2">There are no "{selectedCategory}" requests currently open.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPickups.map((pickup) => (
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
                   <div className="flex items-center gap-3 text-gray-400 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      {pickup.pickup_date} <span className="opacity-20">|</span> <Clock className="w-4 h-4 text-emerald-500" /> {pickup.time_slot}
                   </div>
                   
                   <div className="flex items-start gap-3 text-gray-400 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-tight line-clamp-1">{pickup.address_line}</span>
                   </div>

                   <div className="p-4 bg-gray-50 rounded-2xl min-h-[80px]">
                      <p className="text-gray-500 text-sm font-medium leading-relaxed italic line-clamp-2">
                        "{pickup.description || 'No specific details provided.'}"
                      </p>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                   <button 
                    onClick={() => openDetails(pickup)}
                    className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-colors"
                   >
                    <Eye className="w-4 h-4" /> View Details
                   </button>
                   
                   <button 
                    onClick={() => handleBookPickup(pickup.id)}
                    className="px-6 py-3 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95 shadow-lg"
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
                    <Link to="/register" className="inline-block px-10 py-4 bg-white text-emerald-900 font-black rounded-2xl hover:bg-emerald-50 transition-all active:scale-95">
                        Join as Collector
                    </Link>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
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
