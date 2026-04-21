import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Trash2, PlusCircle, ArrowRight, Loader2, User } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [wasteCount, setWasteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, wasteRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/wastes')
        ]);
        setUser(userRes.data);
        setWasteCount(wasteRes.data.length);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.full_name}!
              </h1>
              <p className="text-gray-500">Here's what's happening with your waste management today.</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Records</p>
              <h3 className="text-4xl font-black text-gray-900 mt-1">{wasteCount}</h3>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl">
              <Trash2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-2xl shadow-lg shadow-green-100 flex items-center justify-between text-white">
            <div>
              <h3 className="text-xl font-bold mb-1">Ready to track?</h3>
              <p className="text-green-100 text-sm opacity-90">Log your latest waste disposal now.</p>
            </div>
            <Link 
              to="/waste" 
              className="bg-white text-green-700 p-3 rounded-xl hover:bg-green-50 transition-colors shadow-sm"
            >
              <PlusCircle className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Quick Actions / Empty State Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Quick Navigation</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/waste" 
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Trash2 className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-semibold text-gray-700">Go to Waste Management</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transform group-hover:translate-x-1 transition-all" />
            </Link>

            {wasteCount === 0 && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 text-sm">
                <strong>Pro Tip:</strong> You haven't added any waste records yet. Head over to the manager to start tracking!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
