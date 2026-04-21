import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Truck, PlusCircle, ArrowRight, Loader2, User, Clock, CheckCircle, ListChecks } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, booked: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, wasteRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/wastes')
        ]);
        setUser(userRes.data);
        const requests = wasteRes.data;
        setStats({
          total: requests.length,
          pending: requests.filter(r => r.status === 'OPEN').length,
          booked: requests.filter(r => r.status === 'BOOKED').length
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
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
              <Link to="/waste" className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                <PlusCircle className="w-5 h-5" /> New Request
              </Link>
            ) : (
              <Link to="/pickups" className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Truck className="w-5 h-5" /> Browse Pickups
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                <ListChecks className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Records</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900">{stats.pending}</span>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Booking</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900">{stats.booked}</span>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Upcoming Pickups</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-100">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black mb-2">Need Help?</h3>
              <p className="text-emerald-100 opacity-80 font-medium">Check our guide on how to categorize your waste for better pricing.</p>
            </div>
            <button className="px-8 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-2 active:scale-95">
              View Guide <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full translate-y-1/2 translate-x-1/4 blur-2xl"></div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
