import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Truck, Loader2, Package, Calendar, Clock, MapPin, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await API.get('/auth/me');
      setCurrentUser(userRes.data);
      
      // Fetch requests specifically assigned to this collector
      const wasteRes = await API.get(`/wastes?collector_id=${userRes.data.id}`);
      setBookings(wasteRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCollected = async (id) => {
    try {
        const response = await API.patch(`/wastes/${id}/collect`);
        // Update local state to reflect status change
        setBookings(bookings.map(b => b.id === id ? response.data : b));
        setSuccess("Pickup marked as Collected!");
    } catch (err) {
        setError(err.response?.data?.detail || "Failed to mark as collected.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <main className="max-w-5xl mx-auto py-12 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Bookings</h1>
          <p className="mt-2 text-gray-500 font-medium">Track your scheduled pickups and completion status.</p>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-50 space-y-2 max-w-sm w-full">
          {success && (
            <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center animate-bounce-in border-b-4 border-emerald-800">
              <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center animate-bounce-in border-b-4 border-red-800">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-600" /></div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100 shadow-sm">
            <Truck className="mx-auto h-16 w-16 text-gray-100 mb-6" />
            <h3 className="text-2xl font-black text-gray-900">No bookings yet</h3>
            <p className="text-gray-400 mt-2 font-medium mb-8">You haven't claimed any pickups yet.</p>
            <Link to="/available-pickups" className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95">
              Browse Available Jobs <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active Section */}
            <div>
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                    Scheduled Pickups
                </h2>
                <div className="grid gap-6">
                    {bookings.filter(b => b.status === 'BOOKED').length === 0 ? (
                        <p className="text-gray-400 font-bold italic ml-5">No active jobs at the moment.</p>
                    ) : (
                        bookings.filter(b => b.status === 'BOOKED').map(booking => (
                        <div key={booking.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-emerald-100 transition-all">
                            <div className="flex items-center gap-6 w-full">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black shadow-inner">
                                    #{booking.id}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-amber-200 tracking-widest">Scheduled</span>
                                        <h3 className="font-black text-gray-900">Pickup Job</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {booking.pickup_date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-500" /> {booking.time_slot}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-[#FAF9F6] px-5 py-3 rounded-2xl border border-gray-50 text-xs font-bold text-gray-500 w-full md:w-auto overflow-hidden">
                                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 
                                <span className="truncate">{booking.address_line}</span>
                            </div>
                            <button 
                                onClick={() => handleMarkCollected(booking.id)}
                                className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white font-black text-xs rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Mark Collected
                            </button>
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* History Section */}
            <div>
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 opacity-50">
                    <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                    Job History
                </h2>
                <div className="grid gap-4">
                    {bookings.filter(b => b.status === 'COLLECTED').map(booking => (
                        <div key={booking.id} className="bg-white/50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                             <div className="flex items-center gap-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <h4 className="font-black text-gray-900 text-sm">Job #{booking.id} completed</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{booking.pickup_date}</p>
                                </div>
                             </div>
                             <div className="text-xs font-bold text-gray-400">
                                {booking.quantity} Units Collected
                             </div>
                        </div>
                    ))}
                    {bookings.filter(b => b.status === 'COLLECTED').length === 0 && (
                        <p className="text-gray-400 font-bold italic ml-5 opacity-50 text-sm">No completed jobs yet.</p>
                    )}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
