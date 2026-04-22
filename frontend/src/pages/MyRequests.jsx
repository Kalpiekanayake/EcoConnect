import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { FileText, Loader2, Package, Calendar, Edit2, Trash2, PlusCircle, ChevronRight, CheckCircle2, Clock, Eye } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, catRes] = await Promise.all([
        API.get('/auth/me'),
        API.get('/categories')
      ]);
      setCurrentUser(userRes.data);
      setCategories(catRes.data);
      
      const wasteRes = await API.get(`/wastes?household_id=${userRes.data.id}`);
      setRequests(wasteRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await API.delete(`/wastes/${id}`);
        setRequests(requests.filter(r => r.id !== id));
      } catch (err) {
        alert("Failed to delete request.");
      }
    }
  };

  const openDetails = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <main className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Requests</h1>
                <p className="mt-2 text-gray-500 font-medium">Manage the waste pickup requests you've posted.</p>
            </div>
            <Link to="/browse-requests" className="hidden sm:flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-50 active:scale-95">
                <PlusCircle className="w-4 h-4" /> Post New Waste
            </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-600" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100 shadow-sm">
            <FileText className="mx-auto h-16 w-16 text-gray-100 mb-6" />
            <h3 className="text-2xl font-black text-gray-900">No requests found</h3>
            <p className="text-gray-400 mt-2 font-medium mb-8">You haven't posted any pickup requests yet.</p>
            <Link to="/browse-requests" className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95">
              Create Your First Request <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-emerald-100 transition-all group">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#FAF9F6] rounded-2xl flex items-center justify-center border border-gray-50 shadow-inner">
                        <Package className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border tracking-widest ${
                                req.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                req.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                                {req.status}
                            </span>
                            <h3 className="font-black text-gray-900 line-clamp-1">{req.description || 'Waste Pickup'}</h3>
                        </div>
                        <div className="text-xs text-gray-400 font-bold flex items-center gap-4">
                            <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {req.quantity} {categories.find(c => c.id === req.category_id)?.unit || 'Units'}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.pickup_date}</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                        onClick={() => openDetails(req)}
                        className="p-4 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-gray-100 transition-all shadow-sm"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    {req.status === 'OPEN' && (
                        <>
                            <Link to="/browse-requests" className="p-4 bg-[#FAF9F6] text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-gray-50 transition-all shadow-sm">
                                <Edit2 className="w-5 h-5" />
                            </Link>
                            <button 
                                onClick={() => handleDelete(req.id)}
                                className="p-4 bg-[#FAF9F6] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-gray-50 transition-all shadow-sm"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    {req.status === 'BOOKED' && (
                        <div className="flex items-center gap-2 text-amber-600 font-black text-xs bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
                            <Clock className="w-4 h-4" /> Booked
                        </div>
                    )}
                    {req.status === 'COLLECTED' && (
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-xs bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" /> Collected
                        </div>
                    )}
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
    </div>
  );
};

export default MyRequests;
