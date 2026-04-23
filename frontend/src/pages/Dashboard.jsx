import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { 
  Truck, 
  PlusCircle, 
  ArrowRight, 
  Loader2, 
  Clock, 
  CheckCircle, 
  ListChecks, 
  XCircle, 
  Calendar, 
  Package,
  ChevronRight,
  AlertCircle,
  X,
  Info
} from 'lucide-react';

// --- Local Summary Modal Component ---
const SummaryModal = ({ isOpen, onClose, title, requests, categories, onSelectRequest }) => {
  if (!isOpen) return null;

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Waste';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'BOOKED': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'COLLECTED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 px-8 py-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ListChecks className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map(req => (
                <div 
                  key={req.id} 
                  onClick={() => { onSelectRequest(req); onClose(); }}
                  className="flex items-center justify-between p-5 bg-[#FAF9F6] rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-gray-50">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{getCategoryName(req.category_id)}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <Calendar className="w-3 h-3" /> {req.pickup_date}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200">
                <Info className="w-8 h-8" />
              </div>
              <p className="text-gray-500 font-bold">No requests found for this status.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
          <Link to="/my-requests" className="text-sm font-black text-emerald-600 hover:underline">
            View All My Requests
          </Link>
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    open: 0, 
    booked: 0, 
    collected: 0, 
    cancelled: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryTitle, setSummaryTitle] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, wasteRes, catRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/wastes'),
          API.get('/categories')
        ]);
        
        setUser(userRes.data);
        const allRequests = wasteRes.data;
        setRequests(allRequests.sort((a, b) => b.id - a.id));
        setCategories(catRes.data);

        setStats({
          total: allRequests.length,
          open: allRequests.filter(r => r.status === 'OPEN').length,
          booked: allRequests.filter(r => r.status === 'BOOKED').length,
          collected: allRequests.filter(r => r.status === 'COLLECTED').length,
          cancelled: allRequests.filter(r => r.status === 'CANCELLED').length
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Could not load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Waste';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'BOOKED': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'COLLECTED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const openDetails = (req) => {
    setSelectedRequest(req);
    setIsDetailsOpen(true);
  };

  const handleSummaryClick = (type) => {
    let filtered = [];
    let title = "";

    switch(type) {
      case 'OPEN':
        filtered = requests.filter(r => r.status === 'OPEN');
        title = "Awaiting Booking";
        break;
      case 'BOOKED':
        filtered = requests.filter(r => r.status === 'BOOKED');
        title = "Scheduled Pickups";
        break;
      case 'COLLECTED':
        filtered = requests.filter(r => r.status === 'COLLECTED');
        title = "Completed Requests";
        break;
      case 'TOTAL':
        filtered = requests;
        title = "All Pickup Requests";
        break;
      default:
        filtered = requests;
        title = "Requests";
    }

    setFilteredRequests(filtered);
    setSummaryTitle(title);
    setIsSummaryOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
          <p className="text-emerald-900 font-black animate-pulse uppercase tracking-widest text-xs">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <div className="max-w-6xl mx-auto py-20 px-4 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-500 font-medium mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all active:scale-95"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-12 px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
              {user?.role === 'HOUSEHOLD' ? '🏠' : '🚚'}
            </div>
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">{user?.role}</p>
              <h1 className="text-3xl font-black text-gray-900">Hello, {user?.full_name}!</h1>
              <p className="text-gray-500 font-medium">Ready to manage your environment today?</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            {user?.role === 'HOUSEHOLD' ? (
              <Link to="/browse-requests" className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                <PlusCircle className="w-5 h-5" /> New Request
              </Link>
            ) : (
              <Link to="/available-pickups" className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Truck className="w-5 h-5" /> Browse Pickups
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div 
            onClick={() => handleSummaryClick('OPEN')}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-100 transition-colors">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900">{stats.open}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Awaiting Booking</p>
          </div>
          
          <div 
            onClick={() => handleSummaryClick('BOOKED')}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl group-hover:bg-amber-100 transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900">{stats.booked}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Scheduled Pickups</p>
          </div>

          <div 
            onClick={() => handleSummaryClick('COLLECTED')}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900">{stats.collected}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Completed</p>
          </div>

          <div 
            onClick={() => handleSummaryClick('TOTAL')}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-gray-100 transition-colors">
                <ListChecks className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900">{stats.total}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Requests</p>
          </div>
        </div>

        {/* Recent Requests Section for Households */}
        {user?.role === 'HOUSEHOLD' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Recent Activity</h3>
                <p className="text-gray-500 font-medium">Your latest waste pickup submissions</p>
              </div>
              <Link to="/my-requests" className="px-6 py-3 bg-gray-50 text-gray-900 font-black text-xs rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center gap-2">
                View All Requests <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {requests.length > 0 ? (
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup Date</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requests.slice(0, 5).map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xs">
                              <Package className="w-5 h-5" />
                            </div>
                            <span className="font-black text-gray-900">{getCategoryName(req.category_id)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-gray-600 line-clamp-1">{req.description || 'No description'}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{req.quantity} {req.unit || 'Units'}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                            {req.pickup_date}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => openDetails(req)}
                            className="p-3 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-gray-100 transition-all shadow-sm active:scale-95"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200">
                    <ListChecks className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">No Requests Found</h4>
                  <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">You haven't posted any pickup requests yet. Start by creating one!</p>
                  <Link to="/browse-requests" className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95">
                    <PlusCircle className="w-5 h-5" /> Create Your First Request
                  </Link>
                </div>
              )}
            </div>
            
            {requests.length > 5 && (
              <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
                <Link to="/my-requests" className="text-sm font-black text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-2">
                  View All {requests.length} Requests <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions / Tips Section */}
        <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-100">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black mb-2">Maximize Your Impact</h3>
              <p className="text-emerald-100 opacity-80 font-medium max-w-lg">
                Properly separating your recyclables can increase their value and help collectors process them faster. Check our guide to learn more.
              </p>
            </div>
            <button className="px-8 py-4 bg-white text-emerald-900 font-black rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap shadow-xl">
              View Recycling Guide <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 translate-x-1/4 blur-3xl"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-400/5 rounded-full -translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        </div>
      </main>

      {/* Summary Modal */}
      <SummaryModal 
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        title={summaryTitle}
        requests={filteredRequests}
        categories={categories}
        onSelectRequest={openDetails}
      />

      {/* Full Details Modal */}
      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        categories={categories}
      />
    </div>
  );
};

export default Dashboard;


