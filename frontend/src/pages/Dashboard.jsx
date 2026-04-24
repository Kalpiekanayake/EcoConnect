import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf, Truck, UserCircle, PlusCircle, ListChecks, Calendar, MapPin, Package, Clock, DollarSign, CheckCircle2, AlertCircle, Loader2, ArrowRight, Eye, Tag, Info } from 'lucide-react';

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

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    booked: 0,
    collected: 0
  });

  const [activeTab, setActiveTab] = useState('ALL');
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, catRes, wasteRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/categories'),
          API.get('/wastes')
        ]);

        const currentUser = userRes.data;
        const allWastes = wasteRes.data;
        
        setUser(currentUser);
        setCategories(catRes.data);

        // Filter based on role
        let userRequests = [];
        if (currentUser.role === 'HOUSEHOLD') {
            userRequests = allWastes.filter(w => w.household_id === currentUser.id);
        } else {
            userRequests = allWastes.filter(w => w.collector_id === currentUser.id);
        }

        setRequests(userRequests.sort((a, b) => b.id - a.id));
        
        setStats({
          total: userRequests.length,
          open: userRequests.filter(r => r.status === 'OPEN').length,
          booked: userRequests.filter(r => r.status === 'BOOKED').length,
          collected: userRequests.filter(r => r.status === 'COLLECTED').length
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Could not load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const openDetails = (req) => {
    setSelectedRequest(req);
    setIsDetailsOpen(true);
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  const getFilteredRequests = () => {
    if (activeTab === 'ALL') return requests;
    return requests.filter(r => r.status === activeTab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Preparing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 font-medium mt-2">
                Welcome back, <span className="text-emerald-600 font-bold">{user?.username}</span>! Here's your overview.
            </p>
          </div>
          <Link to="/browse-requests" className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95">
            <PlusCircle className="w-5 h-5" /> New Pickup Request
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="Total Tasks" value={stats.total} icon={<Package className="w-6 h-6" />} color="bg-blue-50 text-blue-600 border-blue-100/50" />
            <StatCard label="Open" value={stats.open} icon={<Eye className="w-6 h-6" />} color="bg-emerald-50 text-emerald-600 border-emerald-100/50" />
            <StatCard label="Booked" value={stats.booked} icon={<Clock className="w-6 h-6" />} color="bg-amber-50 text-amber-600 border-amber-100/50" />
            <StatCard label="Collected" value={stats.collected} icon={<CheckCircle2 className="w-6 h-6" />} color="bg-gray-50 text-gray-400 border-gray-100/50" />
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <TabButton active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')}>All</TabButton>
                    <TabButton active={activeTab === 'OPEN'} onClick={() => setActiveTab('OPEN')}>Open</TabButton>
                    <TabButton active={activeTab === 'BOOKED'} onClick={() => setActiveTab('BOOKED')}>Booked</TabButton>
                    <TabButton active={activeTab === 'COLLECTED'} onClick={() => setActiveTab('COLLECTED')}>Collected</TabButton>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/30">
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Category</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Details</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {getFilteredRequests().length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-8 py-24 text-center">
                                    <div className="max-w-xs mx-auto">
                                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-200 border border-gray-100/50">
                                            <ListChecks className="w-10 h-10" />
                                        </div>
                                        <p className="text-gray-400 font-bold">No requests found in this section.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            getFilteredRequests().map((req) => {
                                const catName = getCategoryName(req.category_id);
                                const style = getCategoryStyles(catName);
                                return (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 ${style.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${style.border}/50`}>
                                                    {style.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 mb-1">{catName}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">ID #{req.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-semibold text-gray-600 line-clamp-1 mb-1">{req.description || 'No description provided'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.quantity} {req.unit || 'Units'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                                                req.status === 'OPEN' ? 'bg-white text-emerald-600 border-emerald-100' : 
                                                req.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => openDetails(req)}
                                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 group-hover:shadow-lg group-hover:shadow-emerald-600/10"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50/50 px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Total Items: {getFilteredRequests().length}</span>
                {user?.role === 'HOUSEHOLD' && (
                    <Link to="/my-requests" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2">View Detailed History <ArrowRight className="w-3 h-3" /></Link>
                )}
                {user?.role === 'COLLECTOR' && (
                    <Link to="/my-bookings" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2">View Detailed History <ArrowRight className="w-3 h-3" /></Link>
                )}
            </div>
        </div>
      </main>

      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        categories={categories}
      />
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div className={`p-4 rounded-2xl ${color} border shadow-sm`}>
                {icon}
            </div>
            <span className="text-3xl font-black text-gray-900">{value}</span>
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        </div>
    </div>
);

const TabButton = ({ children, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
            active ? 'bg-white text-emerald-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
        }`}
    >
        {children}
    </button>
);

export default Dashboard;
