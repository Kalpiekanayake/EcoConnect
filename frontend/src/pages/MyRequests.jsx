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

  useEffect(() => {
    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <main className="max-w-5xl mx-auto py-16 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-8">
            <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse mb-3"></div>
            <div className="h-14 w-40 bg-emerald-50 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse"></div>)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <main className="max-w-5xl mx-auto py-16 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Requests</h1>
                <p className="mt-2 text-lg text-gray-500 font-medium">Manage and track the waste pickup requests you've posted.</p>
            </div>
            <Link to="/browse-requests" className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95">
                <PlusCircle className="w-5 h-5" /> Post New Request
            </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center border-4 border-dashed border-gray-100 shadow-sm animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100/50">
               <FileText className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">No requests posted</h3>
            <p className="text-gray-500 mt-2 font-medium mb-10 leading-relaxed max-w-sm mx-auto">You haven't posted any waste pickup requests yet. Start now and help your community become cleaner.</p>  
            <Link to="/browse-requests" className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95">
              Create Your First Request <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 hover:border-emerald-200 transition-all duration-500 group hover:shadow-2xl hover:shadow-emerald-900/5">
                 <div className="flex items-center gap-8 w-full">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100/50 shadow-inner group-hover:bg-emerald-50 transition-colors duration-500 group-hover:scale-105">
                        <Package className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg border tracking-widest transition-transform group-hover:scale-105 ${
                                req.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                req.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :       
                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                                {req.status}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-emerald-700 transition-colors">{req.description || 'General Waste Pickup'}</h3>
                        </div>
                        <div className="text-xs text-gray-400 font-bold flex flex-wrap items-center gap-6">
                            <span className="flex items-center gap-2 group-hover:text-gray-600 transition-colors"><Package className="w-4 h-4 text-emerald-500" /> {req.quantity} {categories.find(c => c.id === req.category_id)?.unit || 'Units'}</span>
                            <span className="flex items-center gap-2 group-hover:text-gray-600 transition-colors"><Calendar className="w-4 h-4 text-emerald-500" /> {req.pickup_date}</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => openDetails(req)}
                        className="flex-1 md:flex-none p-4 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-gray-100 transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest active:scale-90"
                    >
                        <Eye className="w-5 h-5" /> View
                    </button>
                    {req.status === 'OPEN' && (
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link to="/browse-requests" state={{ editRequest: req }} className="flex-1 md:flex-none p-4 bg-gray-50 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-gray-100 transition-all shadow-sm flex items-center justify-center active:scale-90">
                                <Edit2 className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => handleDelete(req.id)}
                                className="flex-1 md:flex-none p-4 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-100 transition-all shadow-sm flex items-center justify-center active:scale-90"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    {req.status === 'BOOKED' && (
                        <div className="flex items-center gap-3 text-amber-700 font-bold text-xs bg-amber-50 px-6 py-4 rounded-xl border border-amber-100 whitespace-nowrap group-hover:scale-105 transition-transform shadow-sm">
                            <Clock className="w-4 h-4" /> Booked by Collector
                        </div>
                    )}
                    {req.status === 'COLLECTED' && (
                        <div className="flex items-center gap-3 text-emerald-700 font-bold text-xs bg-emerald-50 px-6 py-4 rounded-xl border border-emerald-100 whitespace-nowrap group-hover:scale-105 transition-transform shadow-sm">
                            <CheckCircle2 className="w-4 h-4" /> Successfully Collected
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
