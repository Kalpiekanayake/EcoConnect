import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Truck, Loader2, Package, Calendar, Clock, MapPin, CheckCircle2, ChevronRight, AlertCircle, Eye } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, catRes] = await Promise.all([
        API.get('/auth/me'),
        API.get('/categories')
      ]);
      setCurrentUser(userRes.data);
      setCategories(catRes.data);

      const wasteRes = await API.get(`/wastes?collector_id=${userRes.data.id}`);
      setBookings(wasteRes.data);
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleMarkCollected = async (id) => {
    try {
        const response = await API.patch(`/wastes/${id}/collect`);
        setBookings(bookings.map(b => b.id === id ? response.data : b));
        setSuccess("Pickup marked as Collected!");
    } catch (err) {
        setError(err.response?.data?.detail || "Failed to mark as collected.");
    }
  };

  const openDetails = (booking) => {
    setSelectedRequest(booking);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white">
        <Navbar />
        <main className="max-w-5xl mx-auto py-16 px-4 pt-32">
          <div className="mb-16">
            <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse mb-3"></div>
            <div className="h-5 w-64 bg-gray-50 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-8">
            <div className="h-8 w-40 bg-gray-100 rounded animate-pulse"></div>
            {[1,2].map(i => <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse"></div>)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      <main className="max-w-5xl mx-auto py-16 px-4 pt-32">
        <div className="mb-16 animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-4xl font-black text-dark-slate tracking-tight">My Bookings</h1>
          <p className="mt-2 text-lg text-muted-gray font-medium">Track your scheduled pickups and completion status.</p> 
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
          {success && (
            <div className="bg-primary text-white p-5 rounded-2xl shadow-2xl flex items-center border border-white/20 backdrop-blur-md animate-toast-in">
              <CheckCircle2 className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-white/20 backdrop-blur-md animate-toast-in">
              <AlertCircle className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center border-4 border-dashed border-gray-100 shadow-sm animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100/50">
               <Truck className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-dark-slate">No bookings yet</h3>
            <p className="text-muted-gray mt-2 font-medium mb-10 leading-relaxed max-w-sm mx-auto">You haven't claimed any pickups yet. Start earning now by browsing available jobs.</p>
            <Link to="/available-pickups" className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-bold rounded-xl hover:bg-deep-forest transition-all shadow-xl shadow-primary/20 active:scale-95">
              Browse Available Jobs <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Active Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-2xl font-bold text-dark-slate mb-8 flex items-center gap-3">
                    <span className="w-2 h-10 bg-amber-500 rounded-full shadow-sm shadow-amber-200"></span>
                    Scheduled Pickups
                </h2>
                <div className="grid gap-6">
                    {bookings.filter(b => b.status === 'BOOKED').length === 0 ? (
                        <div className="bg-gray-50/50 rounded-[2.5rem] p-12 border border-gray-100/50 text-center">
                           <p className="text-muted-gray font-bold italic">No active jobs at the moment.</p>    
                        </div>
                    ) : (
                        bookings.filter(b => b.status === 'BOOKED').map(booking => (
                        <div key={booking.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                            <div className="flex items-center gap-8 w-full">
                                <div className="w-20 h-20 bg-soft-mint rounded-3xl flex items-center justify-center text-primary font-black shadow-inner group-hover:bg-primary group-hover:text-white transition-colors duration-500 group-hover:scale-105">
                                    #{booking.id}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-3 py-1 rounded-lg border border-amber-200 tracking-widest group-hover:scale-105 transition-transform">Scheduled</span>
                                        <h3 className="font-bold text-dark-slate text-lg group-hover:text-primary transition-colors">Waste Collection Job</h3>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-xs text-muted-gray font-bold">   
                                        <span className="flex items-center gap-2 group-hover:text-dark-slate transition-colors"><Calendar className="w-4 h-4 text-primary" /> {booking.pickup_date}</span>
                                        <span className="flex items-center gap-2 group-hover:text-dark-slate transition-colors"><Clock className="w-4 h-4 text-primary" /> {booking.time_slot}</span>
                                        <span className="flex items-center gap-2 group-hover:text-dark-slate transition-colors"><Package className="w-4 h-4 text-primary" /> {booking.quantity} {categories.find(c => c.id === booking.category_id)?.unit || 'Units'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => openDetails(booking)}
                                    className="flex-1 md:flex-none p-4 bg-off-white text-muted-gray hover:text-primary hover:bg-soft-mint rounded-xl border border-gray-100 transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest active:scale-90"
                                >
                                    <Eye className="w-5 h-5" /> Details
                                </button>
                                <button
                                    onClick={() => handleMarkCollected(booking.id)}
                                    className="flex-1 md:flex-none px-8 py-4 bg-dark-slate text-white font-bold text-xs rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 whitespace-nowrap"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Mark Collected
                                </button>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* History Section */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <h2 className="text-2xl font-bold text-dark-slate mb-8 flex items-center gap-3 opacity-50">       
                    <span className="w-2 h-10 bg-primary rounded-full shadow-sm shadow-primary/20"></span>
                    Job History
                </h2>
                <div className="grid gap-4">
                    {bookings.filter(b => b.status === 'COLLECTED').map(booking => (
                        <div key={booking.id} className="bg-white/50 rounded-[2rem] p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 group gap-4 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/10">   
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-soft-mint rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                   <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-dark-slate group-hover:text-primary transition-colors">Job #{booking.id} completed</h4>
                                    <p className="text-[10px] text-muted-gray font-bold uppercase tracking-widest mt-0.5">{booking.pickup_date}</p>
                                </div>
                             </div>
                             <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                                <div className="text-xs font-bold text-muted-gray bg-gray-100/50 px-5 py-2.5 rounded-xl border border-transparent group-hover:border-primary/10 group-hover:text-primary transition-all">
                                    {booking.quantity} Units Collected
                                </div>
                                <button
                                    onClick={() => openDetails(booking)}
                                    className="p-3 bg-white text-muted-gray hover:text-primary rounded-xl border border-gray-100 transition-all shadow-sm active:scale-90"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                             </div>
                        </div>
                    ))}
                    {bookings.filter(b => b.status === 'COLLECTED').length === 0 && (
                        <div className="ml-5">
                            <p className="text-muted-gray font-bold italic opacity-50 text-sm">No completed jobs in your history.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </main>
      <RequestDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        categories={categories}
      />
    </div>
  );
};

export default MyBookings;
