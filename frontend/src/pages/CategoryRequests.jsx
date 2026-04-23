import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Tag, Calendar, MapPin, Package, Clock, ArrowLeft, Loader2, DollarSign, Lock, Eye, Truck, CheckCircle2 } from 'lucide-react';

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

const CategoryRequests = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [token] = useState(localStorage.getItem("token"));

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wasteRes, catRes] = await Promise.all([
        API.get('/wastes'),
        API.get('/categories')
      ]);
      
      const allCategories = catRes.data;
      setCategories(allCategories);
      
      const currentCat = allCategories.find(c => c.id === parseInt(categoryId));
      setCategory(currentCat);

      const filtered = wasteRes.data.filter(r => r.category_id === parseInt(categoryId));
      setRequests(filtered.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError('Failed to load requests for this category.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (token) {
        API.get('/auth/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, [categoryId, token]);

  const handleBookPickup = async (id) => {
    if (!token) {
        navigate('/login', { state: { from: { pathname: `/browse-requests/${categoryId}` }, message: 'Please login to book pickups.' } });
        return;
    }

    if (currentUser?.role !== 'COLLECTOR') {
        setError("Only registered Collectors can book pickups.");
        return;
    }

    try {
      await API.patch(`/wastes/${id}/book`);
      setSuccess('Pickup booked successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book pickup.');
    }
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Finding listings...</p>
      </div>
    );
  }

  const categoryStyle = getCategoryStyles(category?.name);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12">
          <Link to="/browse-requests" className="inline-flex items-center text-sm font-black text-emerald-600 hover:gap-2 transition-all gap-1 uppercase tracking-widest mb-6 group">
            <ArrowLeft className="w-4 h-4" /> Back to Categories
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex items-center gap-6">
                <div className={`w-20 h-20 ${categoryStyle.color} rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border-2 border-white`}>
                    {categoryStyle.icon}
                </div>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{category?.name}</h1>
                    <p className="text-gray-500 font-medium mt-1">Available pickup requests for this type.</p>
                </div>
            </div>
            <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm text-center min-w-[140px]">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Active Jobs</p>
              <p className="text-3xl font-black text-emerald-600">{requests.filter(r => r.status === 'OPEN').length}</p>
            </div>
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

        {requests.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-100 py-32 text-center shadow-sm">
            <Tag className="h-16 w-16 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900">No requests in this category</h3>
            <Link to="/browse-requests" className="text-emerald-600 font-bold hover:underline mt-2 inline-block">Be the first to post a request</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((waste) => {
                const style = getCategoryStyles(category?.name);
                return (
                    <div key={waste.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-2">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black ${style.color} ${style.text} border ${style.border} uppercase tracking-widest w-fit`}>
                                <span>{style.icon}</span> {category?.name}
                            </span>
                            {waste.is_sellable ? (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-emerald-600 text-white border border-emerald-700 uppercase tracking-widest w-fit shadow-sm">
                                    <DollarSign className="w-3 h-3 mr-1" /> SELLABLE
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest w-fit">
                                    FREE PICKUP
                                </span>
                            )}
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            waste.status === 'OPEN' ? 'bg-white text-emerald-600 border-emerald-50' : 
                            waste.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                            {waste.status}
                        </span>
                        </div>

                        <div className="space-y-4 mb-8 flex-1">
                            <p className="text-gray-600 text-sm font-medium leading-relaxed min-h-[40px] line-clamp-2 italic">
                                "{waste.description || 'No description provided.'}"
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center text-gray-900 font-black text-sm bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                                    <Package className="w-4 h-4 mr-2 text-emerald-500" />
                                    {waste.quantity} {waste.unit || 'kg'}
                                </div>
                                {waste.is_sellable ? (
                                    <div className="flex items-center text-emerald-700 font-black text-sm bg-emerald-50 p-3 rounded-2xl border border-emerald-100 shadow-sm">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        Rs. {waste.price || 0}
                                    </div>
                                ) : (
                                    <div className="flex items-center text-gray-500 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                                        <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                                        {waste.pickup_date}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-3 text-gray-400 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 leading-tight line-clamp-1">{waste.address_line}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                            <button 
                                onClick={() => openDetails(waste)}
                                className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-colors"
                            >
                                <Eye className="w-4 h-4" /> Details
                            </button>
                            
                            {waste.status === 'OPEN' && (
                                <button 
                                    onClick={() => handleBookPickup(waste.id)}
                                    className="px-6 py-3 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95 shadow-lg"
                                >
                                    {token && currentUser?.role === 'COLLECTOR' ? 'Book Now' : (token ? 'View Only' : <><Lock className="w-3 h-3" /> Login</>)}
                                </button>
                            )}

                            {currentUser?.id === waste.household_id && waste.status === 'OPEN' && (
                                <button 
                                    onClick={() => navigate('/browse-requests', { state: { editRequest: waste } })}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
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

export default CategoryRequests;
