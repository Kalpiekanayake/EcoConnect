import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { LayoutDashboard, Trash2, LogOut, Menu, X, Leaf, Truck, UserCircle, PlusCircle, ListChecks, Calendar, MapPin, Package, Clock, DollarSign, CheckCircle2, AlertCircle, Loader2, ArrowRight, Eye, Tag, Info, Award, Sprout, TrendingUp } from 'lucide-react';

// --- Category Visual Mapping ---
const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { icon: '🥥', color: 'bg-orange-50/50', border: 'border-orange-100', text: 'text-orange-700' },
    'Coconut Husks': { icon: '🌴', color: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-700' },
    'Plastic': { icon: '🥤', color: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700' },
    'Glass': { icon: '🍾', color: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700' },
    'Paper/Cardboard': { icon: '📦', color: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-700' },
    'Food Waste': { icon: '🍎', color: 'bg-red-50/50', border: 'border-red-100', text: 'text-red-700' },
    'General Disposal': { icon: '🗑️', color: 'bg-stone-50/50', border: 'border-stone-100', text: 'text-stone-700' },
  };
  return styles[name] || { icon: '♻️', color: 'bg-primary/5', border: 'border-primary/10', text: 'text-primary' };
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
      <div className="min-h-screen bg-off-white">
        <Navbar />
        <main className="max-w-7xl mx-auto py-16 px-6 pt-32">
          <div className="mb-12">
             <div className="h-12 w-64 bg-stone-100 rounded-xl animate-pulse mb-4"></div>
             <div className="h-6 w-80 bg-stone-50 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[1,2,3,4].map(i => <div key={i} className="h-44 bg-white rounded-3xl border border-border-light animate-pulse"></div>)}
          </div>
          <div className="h-96 bg-white rounded-3xl border border-border-light animate-pulse shadow-corporate"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white font-sans">
      <Navbar />

      <main className="container-custom py-16 pt-40">
        {/* Header - Professional Impact Style */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-up">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft-mint border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <TrendingUp className="w-3 h-3" /> Real-time Performance tracking
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark-slate tracking-tight leading-tight">
              Impact <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-muted-gray font-medium mt-4 text-lg max-w-xl">
                Welcome back, <span className="text-dark-slate font-bold">{user?.username}</span>. You have successfully documented <span className="text-primary font-bold">{stats.total} environmental contributions</span>.
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link to="/browse-requests" className="btn-primary flex-1 md:flex-none py-5 px-10 shadow-corporate-lg">
              <PlusCircle className="w-5 h-5" /> Post New Pickup
            </Link>
          </div>
        </div>

        {/* Stats Grid - Enhanced Professional Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <StatCard label="Environmental Impact" value={stats.total} icon={<Sprout className="w-6 h-6" />} color="bg-corporate-gradient text-white" highlight={true} />
            <StatCard label="Pending Review" value={stats.open} icon={<Eye className="w-6 h-6" />} color="bg-white" />
            <StatCard label="Active Logistics" value={stats.booked} icon={<Truck className="w-6 h-6" />} color="bg-white" />
            <StatCard label="Verified Completion" value={stats.collected} icon={<Award className="w-6 h-6" />} color="bg-white" />
        </div>

        {/* Content Table - Modern Corporate Style */}
        <div className="bg-white rounded-[2.5rem] border border-border-light shadow-corporate-lg overflow-hidden mb-24 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-10 border-b border-border-light flex flex-col lg:flex-row justify-between items-center gap-8 bg-white">
                <div>
                  <h2 className="text-2xl font-extrabold text-dark-slate tracking-tight">Material Stream History</h2>
                  <p className="text-sm text-muted-gray font-medium mt-1">Verified records of waste collection and resource recovery.</p>
                </div>
                <div className="flex bg-off-white p-1.5 rounded-2xl border border-border-light overflow-x-auto max-w-full">
                    <TabButton active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')}>Full History</TabButton>
                    <TabButton active={activeTab === 'OPEN'} onClick={() => setActiveTab('OPEN')}>Open</TabButton>
                    <TabButton active={activeTab === 'BOOKED'} onClick={() => setActiveTab('BOOKED')}>Processing</TabButton>
                    <TabButton active={activeTab === 'COLLECTED'} onClick={() => setActiveTab('COLLECTED')}>Verified</TabButton>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-stone-50/50 border-b border-border-light">
                            <th className="px-10 py-6 text-[10px] font-bold text-muted-gray uppercase tracking-widest">Material Category</th>
                            <th className="px-10 py-6 text-[10px] font-bold text-muted-gray uppercase tracking-widest">Stream Details</th>
                            <th className="px-10 py-6 text-[10px] font-bold text-muted-gray uppercase tracking-widest">Audit Status</th>
                            <th className="px-10 py-6 text-[10px] font-bold text-muted-gray uppercase tracking-widest text-right">Verification</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {getFilteredRequests().length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-10 py-32 text-center">
                                    <div className="max-w-xs mx-auto">
                                        <div className="w-20 h-20 bg-soft-mint rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/10">
                                            <ListChecks className="w-10 h-10" />
                                        </div>
                                        <p className="text-dark-slate font-extrabold text-xl tracking-tight">No documented actions</p>
                                        <p className="text-muted-gray text-sm font-medium mt-2 leading-relaxed">Initiate your first waste recovery request to start building your environmental impact score.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            getFilteredRequests().map((req) => {
                                const catName = getCategoryName(req.category_id);
                                const style = getCategoryStyles(catName);
                                return (
                                    <tr key={req.id} className="hover:bg-soft-mint/10 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 ${style.color} rounded-2xl flex items-center justify-center text-3xl border ${style.border}/50 transition-all group-hover:scale-110 duration-500`}>
                                                    {style.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-extrabold text-dark-slate group-hover:text-primary transition-colors">{catName}</p>
                                                    <p className="text-[10px] font-bold text-muted-gray uppercase tracking-widest mt-1">Ref: #EC-{req.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-bold text-dark-slate line-clamp-1 mb-2">{req.description || 'Standard waste collection'}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider bg-soft-mint px-2 py-0.5 rounded-md border border-primary/10">
                                                  <Package className="w-3 h-3" /> {req.quantity} {req.unit || 'Units'}
                                                </span>
                                                <span className="w-1 h-1 bg-border-light rounded-full"></span>
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-gray uppercase tracking-wider">
                                                  <Calendar className="w-3 h-3" /> {req.pickup_date}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${
                                                req.status === 'OPEN' ? 'bg-soft-mint text-primary border-primary/20' : 
                                                req.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-dark-slate text-white border-transparent'
                                            }`}>
                                                {req.status === 'BOOKED' ? 'LOGISTICS ACTIVE' : req.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button 
                                                onClick={() => openDetails(req)}
                                                className="btn-secondary py-3 px-6 text-xs"
                                            >
                                                Audit Details <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-stone-50/50 px-10 py-8 flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-border-light">
                <div className="text-[10px] font-bold text-muted-gray uppercase tracking-[0.2em]">
                   EcoConnect verified Reporting Engine v4.0
                </div>
                <div className="flex gap-8">
                   {user?.role === 'HOUSEHOLD' && (
                       <Link to="/my-requests" className="text-xs font-bold text-dark-slate hover:text-primary flex items-center gap-2 transition-colors uppercase tracking-widest">
                           Detailed Archives <ArrowRight className="w-4 h-4" />
                       </Link>
                   )}
                   {user?.role === 'COLLECTOR' && (
                       <Link to="/my-bookings" className="text-xs font-bold text-dark-slate hover:text-primary flex items-center gap-2 transition-colors uppercase tracking-widest">
                           Operation Logs <ArrowRight className="w-4 h-4" />
                       </Link>
                   )}
                </div>
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

const StatCard = ({ label, value, icon, color, highlight }) => (
    <div className={`p-10 rounded-[2.5rem] border border-border-light shadow-corporate flex flex-col justify-between h-56 transition-all duration-500 group hover:-translate-y-2 hover:shadow-corporate-lg relative overflow-hidden ${highlight ? color : 'bg-white'}`}>
        {highlight && (
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        )}
        <div className="flex justify-between items-start relative z-10">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${highlight ? 'bg-white/10 border-white/20 text-white' : 'bg-soft-mint border-primary/10 text-primary'}`}>
                {icon}
            </div>
            <span className={`text-5xl font-extrabold tracking-tighter ${highlight ? 'text-white' : 'text-dark-slate'}`}>{value}</span>
        </div>
        <div className="relative z-10">
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${highlight ? 'text-soft-mint/70' : 'text-muted-gray'}`}>{label}</p>
            <div className={`w-8 h-1 rounded-full transition-all duration-500 group-hover:w-16 ${highlight ? 'bg-white/30' : 'bg-primary/20'}`}></div>
        </div>
    </div>
);

const TabButton = ({ children, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
            active ? 'bg-white text-primary shadow-sm border border-border-light' : 'text-muted-gray hover:text-dark-slate'
        }`}
    >
        {children}
    </button>
);


export default Dashboard;

