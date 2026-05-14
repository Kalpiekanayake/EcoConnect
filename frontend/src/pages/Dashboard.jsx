import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Truck, ListChecks, Calendar, Package, Clock, Award, Sprout, ArrowRight, TrendingUp } from 'lucide-react';
import ecoLogo from '../assets/illustrations/eco-logo.png';

const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { icon: '🥥', color: 'bg-orange-50/50', border: 'border-orange-100', text: 'text-orange-700' },
    'Coconut Husks': { icon: '🌴', color: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700' },
    'Plastic': { icon: '🥤', color: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700' },
    'Glass': { icon: '🍾', color: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700' },
    'Paper/Cardboard': { icon: '📦', color: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-700' },
    'Food Waste': { icon: '🍎', color: 'bg-red-50/50', border: 'border-red-100', text: 'text-red-700' },
    'General Disposal': { icon: '🗑️', color: 'bg-stone-50/50', border: 'border-stone-100', text: 'text-stone-700' },
  };
  return styles[name] || { icon: '♻️', color: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700' };
};

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, open: 0, booked: 0, collected: 0 });
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [u, c, w] = await Promise.all([API.get('/auth/me'), API.get('/categories'), API.get('/wastes')]);
        setUser(u.data); setCategories(c.data);
        const ur = u.data.role === 'HOUSEHOLD' ? w.data.filter(x => x.household_id === u.data.id) : w.data.filter(x => x.collector_id === u.data.id);
        setRequests(ur.sort((a, b) => b.id - a.id));
        setStats({ total: ur.length, open: ur.filter(x => x.status === 'OPEN').length, booked: ur.filter(x => x.status === 'BOOKED').length, collected: ur.filter(x => x.status === 'COLLECTED').length });
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getFilteredRequests = () => activeTab === 'ALL' ? requests : requests.filter(r => r.status === activeTab);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-app gap-8">
      <img src={ecoLogo} alt="Logo" className="h-24 w-auto opacity-30 animate-pulse" />
      <div className="font-sans italic text-2xl font-black text-primary opacity-40 tracking-[0.2em] uppercase">EcoConnect</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-app font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-40 pb-24 px-6 lg:px-12">
        {/* Header */}
        <div className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-dark-slate text-[10px] font-extrabold uppercase tracking-widest mb-5">
               <TrendingUp className="w-3 h-3 text-primary" /> Active Terminal
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark-slate tracking-tight leading-tight mb-2">
              Impact Dashboard
            </h1>
            <p className="text-muted-gray font-medium text-lg leading-none">Management console for <span className="text-dark-slate font-bold">{user?.username}</span></p>
          </div>
          <Link to="/browse-requests" className="btn-tactile w-full md:w-auto px-10">Post Request</Link>
        </div>

        {/* Tactile Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in">
            <StatCard label="Total Impact" value={stats.total} icon={<Sprout className="w-6 h-6" />} color="bg-primary" highlight={true} />
            <StatCard label="Pending" value={stats.open} icon={<Clock className="w-6 h-6" />} color="bg-white" />
            <StatCard label="Active Logistics" value={stats.booked} icon={<Truck className="w-6 h-6" />} color="bg-white" />
            <StatCard label="Verified Completed" value={stats.collected} icon={<Award className="w-6 h-6" />} color="bg-white" />
        </div>

        {/* Activity Table - Professional 3D Box */}
        <div className="bg-white rounded-3xl border border-border-light shadow-3d overflow-hidden animate-in">
            <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white">
                <h2 className="text-xl font-extrabold text-dark-slate tracking-tight uppercase">Activity Stream</h2>
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
                    <TabButton active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')}>All</TabButton>
                    <TabButton active={activeTab === 'OPEN'} onClick={() => setActiveTab('OPEN')}>Open</TabButton>
                    <TabButton active={activeTab === 'BOOKED'} onClick={() => setActiveTab('BOOKED')}>Booked</TabButton>
                    <TabButton active={activeTab === 'COLLECTED'} onClick={() => setActiveTab('COLLECTED')}>Verified</TabButton>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-10 py-6">Material Stream</th>
                            <th className="px-10 py-6">Audit Details</th>
                            <th className="px-10 py-6">Tracking Status</th>
                            <th className="px-10 py-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {getFilteredRequests().map((req) => {
                            const style = getCategoryStyles(categories.find(c => c.id === req.category_id)?.name);
                            return (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 ${style.color} rounded-xl flex items-center justify-center text-2xl border border-white shadow-3d group-hover:scale-105 transition-transform`}>{style.icon}</div>
                                            <div>
                                                <p className="text-sm font-extrabold text-dark-slate leading-none mb-1">{categories.find(c => c.id === req.category_id)?.name}</p>
                                                <p className="text-[10px] font-bold text-muted-gray uppercase">#EC-{req.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-sm font-semibold text-dark-slate">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest"><Package className="w-3 h-3" /> {req.quantity} {req.unit}</span>
                                            <span className="text-[10px] font-bold text-muted-gray uppercase">{req.pickup_date}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${req.status === 'OPEN' ? 'bg-white text-primary border-primary/20' : req.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-dark-slate text-white border-transparent'}`}>{req.status}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }} className="btn-tactile-secondary h-10 px-6 text-[10px] rounded-lg">Audit <ArrowRight className="w-3.5 h-3.5 ml-1" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
      <RequestDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} request={selectedRequest} categories={categories} />
    </div>
  );
};

const StatCard = ({ label, value, icon, highlight }) => (
    <div className={`p-8 rounded-3xl border border-border-light shadow-3d flex flex-col justify-between h-52 transition-all duration-300 group hover:-translate-y-1 hover:shadow-3d-elevated ${highlight ? 'bg-primary text-white border-primary/20' : 'bg-white'}`}>
        <div className="flex justify-between items-start">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${highlight ? 'bg-white/20 text-white shadow-3d' : 'bg-slate-50 text-primary border border-slate-100'}`}>{icon}</div>
            <span className="text-5xl font-extrabold tracking-tighter leading-none">{value}</span>
        </div>
        <div>
            <p className={`text-[11px] font-extrabold uppercase tracking-[0.2em] mb-1.5 ${highlight ? 'text-white/80' : 'text-muted-gray'}`}>{label}</p>
            <div className={`w-8 h-1 rounded-full transition-all group-hover:w-16 ${highlight ? 'bg-white/40' : 'bg-primary/20'}`}></div>
        </div>
    </div>
);

const TabButton = ({ children, active, onClick }) => (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-[0.15em] transition-all whitespace-nowrap ${active ? 'bg-white text-primary shadow-3d border border-slate-200' : 'text-muted-gray hover:text-dark-slate'}`}>{children}</button>
);

export default Dashboard;
