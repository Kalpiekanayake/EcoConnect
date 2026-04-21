import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Truck, Loader2, Package, Calendar, Clock, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This will fetch requests where collector_id == current_user.id
    // For now fetching all as placeholder until specific endpoint exists
    API.get('/wastes')
      .then(res => {
        // Filter locally for simulation if needed
        setBookings(res.data.filter(b => b.status === 'BOOKED'));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <main className="max-w-5xl mx-auto py-12 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Bookings</h1>
          <p className="mt-2 text-gray-500 font-medium">Track your scheduled pickups and completion status.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-600" /></div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-gray-100">
            <Truck className="mx-auto h-16 w-16 text-gray-100 mb-6" />
            <h3 className="text-2xl font-black text-gray-900">No active bookings</h3>
            <p className="text-gray-400 mt-2 font-medium mb-8">You haven't claimed any pickups yet.</p>
            <Link to="/available-pickups" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
              Browse Available Jobs <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black">
                        #{booking.id}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-amber-200">Scheduled</span>
                            <h3 className="font-black text-gray-900">Pickup Job</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.pickup_date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.time_slot}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-[#FAF9F6] px-5 py-3 rounded-2xl border border-gray-50 text-xs font-bold text-gray-500">
                    <MapPin className="w-4 h-4 text-emerald-500" /> {booking.address_line}
                </div>
                <button className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <CheckCircle2 className="w-4 h-4" /> Mark Collected
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
