import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Tag, Calendar, MapPin, Package, Clock, ArrowLeft, Loader2, DollarSign, Lock, Eye, Truck, CheckCircle2, Edit2 } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <main className="max-w-6xl mx-auto py-16 px-4">
          <div className="mb-12">
             <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-6"></div>
             <div className="flex gap-8 items-center">
                <div className="w-28 h-28 bg-gray-100 rounded-[2.5rem] animate-pulse"></div>
                <div className="flex-1">
                   <div className="h-10 w-64 bg-gray-100 rounded animate-pulse mb-2"></div>
                   <div className="h-5 w-48 bg-gray-50 rounded animate-pulse"></div>
                </div>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-96 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse"></div>)}
          </div>
        </main>
      </div>
    );
  }

  const categoryStyle = getCategoryStyles(category?.name);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link to="/browse-requests" className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-all gap-1.5 uppercase tracking-widest mb-8 group active:scale-95">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" /> Back to Categories
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-8">
                <div className={`w-28 h-28 ${categoryStyle.color} rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border-2 border-white group hover:rotate-3 transition-transform duration-500`}>
                    {categoryStyle.icon}
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{category?.name}</h1>
                    <p className="text-lg text-gray-500 font-medium mt-2">Available pickup requests for this category.</p>
                </div>
            </div>
            <div className="bg-white px-10 py-5 rounded-[2rem] border border-gray-100 shadow-sm text-center min-w-[160px] hover:shadow-md transition-shadow">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Active Jobs</p>
              <p className="text-4xl font-black text-emerald-600">{requests.filter(r => r.status === 'OPEN').length}</p>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
          {success && (
            <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-emerald-500/50 backdrop-blur-md animate-toast-in">
              <CheckCircle2 className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-red-500/50 backdrop-blur-md animate-toast-in">
              <AlertCircle className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-100 py-32 text-center shadow-sm animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100/50">
               <Tag className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">No requests found</h3>
            <p className="text-gray-500 font-medium mt-2 mb-8 max-w-xs mx-auto leading-relaxed">Be the first to post a request in this category and help organize local waste collection.</p>
            <Link to="/browse-requests" className="px-10 py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Post Request Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {requests.map((waste) => {
                const style = getCategoryStyles(category?.name);
                return (
                    <div key={waste.id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 group flex flex-col h-full hover:border-emerald-200 hover:-translate-y-2">
                        <div className="flex justify-between items-start mb-8">
                        <div className="flex flex-col gap-2">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-bold ${style.color} ${style.text} border ${style.border}/50 uppercase tracking-widest w-fit group-hover:scale-105 transition-transform`}>
                                <span className="text-xl">{style.icon}</span> {category?.name}
                            </span>
                            {waste.is_sellable ? (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-600 text-white border border-emerald-500 uppercase tracking-widest w-fit shadow-sm shadow-emerald-100">
                                    <DollarSign className="w-3.5 h-3.5 mr-1" /> SELLABLE
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest w-fit">
                                    FREE PICKUP
                                </span>
                            )}
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border shadow-sm transition-all duration-300 group-hover:scale-105 ${
                            waste.status === 'OPEN' ? 'bg-white text-emerald-600 border-emerald-100 shadow-sm' : 
                            waste.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                            {waste.status}
                        </span>
                        </div>

                        <div className="space-y-6 mb-10 flex-1">
                            <p className="text-gray-600 text-sm font-semibold leading-relaxed min-h-[48px] line-clamp-3 group-hover:text-gray-900 transition-colors">
                                "{waste.description || 'No additional details provided.'}"
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center text-gray-900 font-bold text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-white transition-colors">
                                    <Package className="w-4 h-4 mr-3 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    {waste.quantity} {waste.unit || 'kg'}
                                </div>
                                {waste.is_sellable ? (
                                    <div className="flex items-center text-emerald-700 font-black text-xs bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm group-hover:shadow-md transition-all">
                                        <DollarSign className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                                        Rs. {waste.price || 0}
                                    </div>
                                ) : (
                                    <div className="flex items-center text-gray-500 text-xs font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-white transition-colors">
                                        <Calendar className="w-4 h-4 mr-3 text-emerald-500" />
                                        {waste.pickup_date}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-4 text-gray-500 text-xs font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-white transition-colors">
                                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 leading-normal line-clamp-2">{waste.address_line}</span>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 flex items-center justify-between mt-auto">
                            <button 
                                onClick={() => openDetails(waste)}
                                className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-all active:scale-95"
                            >
                                <Eye className="w-4 h-4" /> View Details
                            </button>
                            
                            {waste.status === 'OPEN' && (
                                <button 
                                    onClick={() => handleBookPickup(waste.id)}
                                    className="px-8 py-3.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-90 shadow-lg shadow-gray-200"
                                >
                                    {token && currentUser?.role === 'COLLECTOR' ? 'Claim Pickup' : (token ? 'View Listing' : <><Lock className="w-3.5 h-3.5" /> Login</>)}
                                </button>
                            )}

                            {currentUser?.id === waste.household_id && waste.status === 'OPEN' && (
                                <button 
                                    onClick={() => navigate('/browse-requests', { state: { editRequest: waste } })}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all active:scale-90 shadow-sm"
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
