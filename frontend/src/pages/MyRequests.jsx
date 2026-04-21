import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { FileText, Loader2, Package, Calendar, Edit2, Trash2, PlusCircle, ChevronRight } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now fetching all, ideally a backend route for user specific requests
    API.get('/wastes')
      .then(res => setRequests(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <main className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Requests</h1>
                <p className="mt-2 text-gray-500 font-medium">Manage the waste pickup requests you've posted.</p>
            </div>
            <Link to="/browse-requests" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50">
                <PlusCircle className="w-4 h-4" /> Post New
            </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-600" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100">
            <FileText className="mx-auto h-16 w-16 text-gray-100 mb-6" />
            <h3 className="text-2xl font-black text-gray-900">No requests found</h3>
            <p className="text-gray-400 mt-2 font-medium mb-8">You haven't posted any pickup requests yet.</p>
            <Link to="/browse-requests" className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
              Create Your First Request <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#FAF9F6] rounded-2xl flex items-center justify-center border border-gray-50">
                        <Package className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${req.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{req.status}</span>
                            <h3 className="font-black text-gray-900 line-clamp-1">{req.description || 'Pickup Request'}</h3>
                        </div>
                        <div className="text-xs text-gray-400 font-bold flex gap-4">
                            <span>{req.quantity} Units</span>
                            <span>{req.pickup_date}</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button className="p-4 bg-[#FAF9F6] text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-gray-50 transition-all shadow-sm">
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button className="p-4 bg-[#FAF9F6] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-gray-50 transition-all shadow-sm">
                        <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRequests;
