import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { FileText, Loader2, Package, Calendar, Edit2, Trash2, PlusCircle, CheckCircle2, Clock, Eye } from 'lucide-react';

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
      <div className="min-h-screen bg-off-white">
        <Navbar />
        <main className="max-w-7xl mx-auto py-16 px-6 pt-32">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-8">   
            <div className="h-12 w-48 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-16 w-48 bg-emerald-50 rounded-2xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-[3rem] border border-gray-100 animate-pulse"></div>)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white relative overflow-hidden">
      <Navbar />

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-deep-forest/5 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

      <main className="max-w-7xl mx-auto py-16 px-6 sm:px-8 pt-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div>
                <h1 className="text-5xl font-extrabold text-dark-slate tracking-behance leading-tight">My Requests</h1>
                <p className="mt-3 text-xl text-muted-gray font-medium">Manage and track your active collection posts.</p>
            </div>
            <Link to="/browse-requests" className="flex items-center gap-3 px-10 py-5 bg-dark-slate text-white font-bold rounded-2xl hover:bg-black transition-all shadow-2xl hover:scale-105 active:scale-95 group">
                <PlusCircle className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform duration-500" /> New Request
            </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-[4rem] p-24 text-center border-4 border-dashed border-gray-100 shadow-sm animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100/50">
               <FileText className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-3xl font-extrabold text-dark-slate tracking-behance">Quiet Atmosphere</h3>
            <p className="text-muted-gray mt-3 font-medium mb-12 max-w-sm mx-auto leading-relaxed">You haven't posted any pickup requests yet. Start your journey towards zero waste today.</p>
            <Link to="/browse-requests" className="inline-flex items-center gap-3 px-12 py-6 bg-primary text-white font-bold rounded-2xl hover:bg-deep-forest transition-all shadow-xl shadow-primary/20 active:scale-95 text-lg">
              Post First Request
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {requests.map(req => (
              <div key={req.id} className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white shadow-2xl shadow-gray-200/50 flex flex-col md:flex-row justify-between items-center gap-10 hover:border-primary/20 transition-all duration-500 group hover:shadow-primary/5">
                 <div className="flex items-center gap-10 w-full">
                    <div className="w-24 h-24 bg-off-white rounded-[2rem] flex items-center justify-center border border-gray-100/50 shadow-inner group-hover:bg-soft-mint transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">   
                        <Package className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                            <span className={`text-[10px] font-bold uppercase px-4 py-1.5 rounded-full border tracking-[0.2em] transition-all group-hover:scale-105 ${
                                req.status === 'OPEN' ? 'bg-white text-blue-600 border-blue-100 shadow-sm' :
                                req.status === 'BOOKED' ? 'bg-amber-50 text-amber-600 border-amber-100' :       
                                'bg-soft-mint text-primary border-primary/10'
                            }`}>
                                {req.status}
                            </span>
                            <h3 className="font-bold text-dark-slate text-2xl group-hover:text-primary transition-colors tracking-tight">{req.description || 'General Waste Pickup'}</h3>
                        </div>
                        <div className="text-sm text-muted-gray font-bold flex flex-wrap items-center gap-10">     
                            <span className="flex items-center gap-3 group-hover:text-dark-slate transition-colors"><Package className="w-5 h-5 text-primary" /> {req.quantity} {categories.find(c => c.id === req.category_id)?.unit || 'Units'}</span>
                            <span className="flex items-center gap-3 group-hover:text-dark-slate transition-colors"><Calendar className="w-5 h-5 text-primary" /> {req.pickup_date}</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-5 w-full md:w-auto">
                    <button
                        onClick={() => openDetails(req)}
                        className="flex-1 md:flex-none px-8 py-5 bg-white text-muted-gray hover:text-primary hover:bg-soft-mint rounded-2xl border border-gray-100 transition-all shadow-sm flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] active:scale-90"
                    >
                        <Eye className="w-5 h-5" /> View
                    </button>
                    {req.status === 'OPEN' && (
                        <div className="flex items-center gap-5 w-full md:w-auto">
                            <Link to="/browse-requests" state={{ editRequest: req }} className="flex-1 md:flex-none p-5 bg-gray-50 text-muted-gray hover:text-amber-600 hover:bg-amber-50 rounded-2xl border border-gray-100 transition-all shadow-sm flex items-center justify-center active:scale-90">
                                <Edit2 className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => handleDelete(req.id)}
                                className="flex-1 md:flex-none p-5 bg-gray-50 text-muted-gray hover:text-red-600 hover:bg-red-50 rounded-2xl border border-gray-100 transition-all shadow-sm flex items-center justify-center active:scale-90"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    {req.status === 'BOOKED' && (
                        <div className="flex items-center gap-4 text-amber-600 font-bold text-xs bg-amber-50 px-8 py-5 rounded-2xl border border-amber-100 whitespace-nowrap group-hover:scale-105 transition-transform shadow-lg shadow-amber-900/5">
                            <Clock className="w-5 h-5" /> Pending Collection
                        </div>
                    )}
                    {req.status === 'COLLECTED' && (
                        <div className="flex items-center gap-4 text-primary font-bold text-xs bg-soft-mint px-8 py-5 rounded-2xl border border-primary/10 whitespace-nowrap group-hover:scale-105 transition-transform shadow-lg shadow-primary/5">
                            <CheckCircle2 className="w-5 h-5" /> Successfully Completed
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
