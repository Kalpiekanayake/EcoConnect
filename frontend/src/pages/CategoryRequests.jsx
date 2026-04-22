import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { ArrowLeft, Loader2, Tag, Calendar, Package, Eye, DollarSign, Edit2, Trash2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const CategoryRequests = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]); // Needed for the modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [token] = useState(localStorage.getItem("token"));

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
    if (token) {
        API.get('/auth/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, [categoryId, token]);

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

      // Filter requests by this category
      const filtered = wasteRes.data.filter(r => r.category_id === parseInt(categoryId));
      setRequests(filtered.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError('Failed to load requests for this category.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookPickup = async (id) => {
    if (!token) {
        navigate('/login', { state: { from: { pathname: `/browse-requests/${categoryId}` }, message: 'Please login to book pickups.' } });
        return;
    }
    if (currentUser?.role !== 'COLLECTOR') {
        setError("Only collectors can book pickups.");
        return;
    }
    try {
        const response = await API.patch(`/wastes/${id}/book`);
        setRequests(requests.map(w => w.id === id ? response.data : w));
        setSuccess("Pickup booked successfully!");
    } catch (err) {
        setError(err.response?.data?.detail || "Failed to book pickup.");
    }
  };

  const openDetails = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold">Loading listings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/browse-requests" 
            className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-all mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Categories
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                  <Tag className="w-5 h-5" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{category?.name || 'Category'} Listings</h1>
              </div>
              <p className="text-gray-500 font-medium">Viewing all active pickup requests for this waste type.</p>
            </div>
            <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm text-center min-w-[120px]">
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Results</p>
              <p className="text-2xl font-black text-emerald-700">{requests.length}</p>
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

        {/* List Grid */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100 py-32 text-center">
            <div className="bg-[#FAF9F6] h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-200" />
            </div>
            <p className="text-gray-900 text-xl font-black">No requests found</p>
            <p className="text-sm text-gray-400 mt-2 font-medium max-w-xs mx-auto">
              There are currently no active pickup requests in the "{category?.name}" category.
            </p>
            <Link to="/browse-requests" className="inline-block mt-8 px-8 py-3 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-widest">
              Browse Other Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {requests.map((waste) => (
              <div 
                key={waste.id} 
                className="group bg-white rounded-[2rem] p-8 shadow-sm border-2 border-white hover:border-emerald-50 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest w-fit">
                        {category?.name}
                      </span>
                      {waste.is_sellable && (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-widest w-fit">
                              <DollarSign className="w-3 h-3 mr-1" /> Sellable
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

                <div className="space-y-4 mb-8">
                  <p className="text-gray-600 text-sm font-medium leading-relaxed min-h-[40px] line-clamp-2 italic">
                    "{waste.description || 'No description provided.'}"
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-900 font-black text-sm bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                      <Package className="w-4 h-4 mr-2 text-emerald-500" />
                      {waste.quantity} {category?.unit || 'Units'}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                      <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                      {waste.pickup_date}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                  <button 
                      onClick={() => openDetails(waste)}
                      className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                  >
                      <Eye className="w-4 h-4" /> View Details
                  </button>
                  
                  <div className="flex items-center gap-2">
                      {token && currentUser?.role === 'COLLECTOR' && waste.status === 'OPEN' && (
                          <button 
                              onClick={() => handleBookPickup(waste.id)}
                              className="px-8 py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all active:scale-95"
                          >
                              Book Now
                          </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
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
