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
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <main className="max-w-7xl mx-auto py-16 px-6 pt-32">
          <div className="mb-12">
             <div className="h-12 w-64 bg-gray-100 rounded-xl animate-pulse mb-4"></div>
             <div className="h-6 w-80 bg-gray-50 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[1,2,3,4].map(i => <div key={i} className="h-44 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse"></div>)}
          </div>
          <div className="h-96 bg-white rounded-[3rem] border border-gray-100 animate-pulse shadow-sm"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="max-w-7xl mx-auto py-16 px-6 sm:px-8 pt-32">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-5xl font-black text-gray-900 tracking-behance leading-tight">Your Impact Dashboard</h1>
            <p className="text-gray-500 font-medium mt-3 text-lg">
                Welcome back, <span className="text-emerald-600 font-bold">{user?.username}</span>. You're making a difference.
            </p>
          </div>
          <Link to="/browse-requests" className="px-10 py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
            <PlusCircle className="w-5 h-5 text-emerald-400" /> New Pickup Request
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <StatCard label="Total Impact" value={stats.total} icon={<Package className="w-6 h-6" />} color="bg-emerald-600 text-white" glassy={true} />
            <StatCard label="Pending Pickups" value={stats.open} icon={<Eye className="w-6 h-6" />} color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Active Bookings" value={stats.booked} icon={<Clock className="w-6 h-6" />} color="bg-amber-50 text-amber-600" />
            <StatCard label="Completed" value={stats.collected} icon={<CheckCircle2 className="w-6 h-6" />} color="bg-gray-100 text-gray-400" />
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-8 bg-gray-50/20">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Activity</h2>
                <div className="flex bg-gray-100/60 p-1.5 rounded-2xl border border-gray-100 backdrop-blur-sm">
                    <TabButton active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')}>All Activity</TabButton>
                    <TabButton active={activeTab === 'OPEN'} onClick={() => setActiveTab('OPEN')}>Open</TabButton>
                    <TabButton active={activeTab === 'BOOKED'} onClick={() => setActiveTab('BOOKED')}>Booked</TabButton>
                    <TabButton active={activeTab === 'COLLECTED'} onClick={() => setActiveTab('COLLECTED')}>Collected</TabButton>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Category</th>
                            <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Details</th>
                            <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Status</th>
                            <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {getFilteredRequests().length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-10 py-32 text-center">
                                    <div className="max-w-xs mx-auto">
                                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-200 border border-gray-100 shadow-inner">
                                            <ListChecks className="w-10 h-10" />
                                        </div>
                                        <p className="text-gray-400 font-bold text-lg">No requests found</p>
                                        <p className="text-gray-400 text-sm font-medium mt-2">Your waste management journey begins with your first post.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            getFilteredRequests().map((req) => {
                                const catName = getCategoryName(req.category_id);
                                const style = getCategoryStyles(catName);
                                return (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 ${style.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${style.border}/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                                    {style.icon}
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-gray-900 mb-1">{catName}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Job ID #{req.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-semibold text-gray-600 line-clamp-1 mb-2">"{req.description || 'No additional details'}"</p>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider">{req.quantity} {req.unit || 'Units'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-sm transition-all duration-500 group-hover:px-6 ${
                                                req.status === 'OPEN' ? 'bg-white text-emerald-600 border-emerald-100 glow-emerald' : 
                                                req.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button 
                                                onClick={() => openDetails(req)}
                                                className="p-4 bg-white text-gray-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-sm hover:shadow-xl hover:shadow-emerald-600/20 border border-gray-100"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50/50 px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span>{getFilteredRequests().length} Total Results</span>
                </div>
                {user?.role === 'HOUSEHOLD' && (
                    <Link to="/my-requests" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-3 group/link px-6 py-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-all shadow-sm">
                        Manage History <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                    </Link>
                )}
                {user?.role === 'COLLECTOR' && (
                    <Link to="/my-bookings" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-3 group/link px-6 py-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-all shadow-sm">
                        Manage History <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                    </Link>
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

const StatCard = ({ label, value, icon, color, glassy }) => (
    <div className={`p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between h-52 transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl ${glassy ? 'bg-eco-gradient text-white border-transparent glow-emerald' : 'bg-white'}`}>
        <div className="flex justify-between items-start">
            <div className={`p-4 rounded-2xl border shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${glassy ? 'bg-white/10 border-white/20' : color + ' border-gray-100/50 bg-gray-50/50'}`}>
                {icon}
            </div>
            <span className={`text-4xl font-black tracking-behance ${glassy ? 'text-white' : 'text-gray-900'}`}>{value}</span>
        </div>
        <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${glassy ? 'text-emerald-100' : 'text-gray-400'}`}>{label}</p>
        </div>
    </div>
);

const TabButton = ({ children, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 ${
            active ? 'bg-white text-emerald-600 shadow-xl shadow-gray-200/50 border border-gray-100' : 'text-gray-400 hover:text-gray-600'
        }`}
    >
        {children}
    </button>
);

export default Dashboard;
