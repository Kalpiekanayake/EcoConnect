import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Plus, Trash2, Loader2, AlertCircle, Tag, Calendar, FileText, Edit2, X, CheckCircle2, Package, MapPin, Clock, DollarSign, Lock, Eye, Database, ArrowRight, Navigation, Truck } from 'lucide-react';

// Map imports
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Time Selector Helpers ---
const timeOptions = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"
];

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return 0;
  const [time, period] = parts;
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// --- Map Interaction Component ---
const MapController = ({ setPosition }) => {
    const map = useMapEvents({
        moveend() {
            const center = map.getCenter();
            setPosition([center.lat, center.lng]);
        },
    });
    return null;
};

// --- Component to Move Map ---
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 16);
    }, [center, map]);
    return null;
};

const Waste = () => {
  const [wastes, setWastes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [searchingMap, setSearchingMap] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Map state (default to Colombo, Sri Lanka)
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    category_id: '',
    quantity: '',
    pickup_date: '',
    startTime: '',
    endTime: '',
    time_slot: '',
    address_line: '',
    latitude: 6.9271,
    longitude: 79.8612,
    is_sellable: false,
    estimated_price: ''
  });

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchInitialData();
    if (token) {
        API.get('/auth/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, [token]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [wasteRes, catRes] = await Promise.all([
        API.get('/wastes'),
        API.get('/categories')
      ]);
      setWastes(wasteRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError('Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  };

  const seedCategories = async () => {
    setSubmitting(true);
    try {
        await API.post('/categories/seed');
        const res = await API.get('/categories');
        setCategories(res.data);
        setSuccess('Categories initialized successfully!');
    } catch (err) {
        setError('Failed to initialize categories.');
    } finally {
        setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category_id' && value !== '') {
        const selectedCat = categories.find(c => c.id === parseInt(value));
        if (selectedCat) {
            setFormData(prev => ({
                ...prev,
                category_id: value,
                is_sellable: selectedCat.is_sellable,
                estimated_price: selectedCat.is_sellable ? (prev.quantity ? (parseFloat(prev.quantity) * selectedCat.base_price_per_unit).toFixed(2) : '') : ''
            }));
            return;
        }
    }

    if (name === 'startTime' || name === 'endTime') {
        const newStart = name === 'startTime' ? value : formData.startTime;
        const newEnd = name === 'endTime' ? value : formData.endTime;
        
        setFormData(prev => ({
            ...prev,
            [name]: value,
            time_slot: newStart && newEnd ? `${newStart} - ${newEnd}` : ''
        }));

        if (newStart && newEnd) {
            if (timeToMinutes(newStart) >= timeToMinutes(newEnd)) {
                setError("End time must be later than start time");
            } else {
                setError("");
            }
        }
        return;
    }

    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleFindOnMap = async () => {
    if (!formData.address_line) {
        setError("Please type an address first.");
        return;
    }
    setSearchingMap(true);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address_line)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const newPos = [parseFloat(lat), parseFloat(lon)];
            setMapCenter(newPos);
            setFormData(prev => ({
                ...prev,
                latitude: newPos[0],
                longitude: newPos[1]
            }));
            setSuccess("Address found on map!");
        } else {
            setError("Could not find that address on the map.");
        }
    } catch (err) {
        setError("Search failed. Please try again.");
    } finally {
        setSearchingMap(false);
    }
  };

  const handleConfirmLocation = async () => {
    setFetchingAddress(true);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${mapCenter[0]}&lon=${mapCenter[1]}`);
        const data = await response.json();
        if (data && data.display_name) {
            setFormData(prev => ({
                ...prev,
                address_line: data.display_name,
                latitude: mapCenter[0],
                longitude: mapCenter[1]
            }));
            setSuccess("Location confirmed!");
        }
    } catch (err) {
        setFormData(prev => ({ ...prev, latitude: mapCenter[0], longitude: mapCenter[1] }));
        setError("Location saved without address lookup.");
    } finally {
        setFetchingAddress(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setMapCenter([6.9271, 79.8612]);
    setFormData({ 
      description: '', 
      category_id: '', 
      quantity: '', 
      pickup_date: '', 
      startTime: '',
      endTime: '',
      time_slot: '', 
      address_line: '', 
      latitude: 6.9271,
      longitude: 79.8612,
      is_sellable: false, 
      estimated_price: '' 
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
        navigate('/login', { state: { from: { pathname: '/browse-requests' } } });
        return;
    }
    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }
    if (timeToMinutes(formData.startTime) >= timeToMinutes(formData.endTime)) {
      setError('End time must be later than start time');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        quantity: parseFloat(formData.quantity),
        estimated_price: formData.is_sellable ? parseFloat(formData.estimated_price || 0) : 0
      };
      delete payload.startTime;
      delete payload.endTime;

      if (isEditing) {
        await API.put(`/wastes/${editId}`, payload);
        setSuccess('Request updated successfully!');
      } else {
        await API.post('/wastes', payload);
        setSuccess('New pickup request added!');
      }
      fetchInitialData();
      handleCancel();
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-400 font-bold">Loading Categories...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Browse Requests</h1>
            <p className="mt-2 text-gray-500 font-medium">Select a category to view active pickup requests.</p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 hidden sm:block shadow-sm text-center min-w-[120px]">
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Total Jobs</p>
            <p className="text-2xl font-black text-emerald-700">{wastes.length}</p>
          </div>
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

        {/* Category Selection Grid */}
        <div className="mb-20">
            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-1 bg-emerald-600 rounded-full"></div>
                Waste Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat) => {
                    const count = wastes.filter(w => w.category_id === cat.id && w.status === 'OPEN').length;
                    return (
                        <Link 
                            key={cat.id} 
                            to={`/browse-requests/${cat.id}`}
                            className="p-8 rounded-[2.5rem] border-2 border-white bg-white shadow-sm transition-all hover:shadow-xl hover:border-emerald-100 hover:-translate-y-1 active:scale-95 group flex flex-col justify-between h-52 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start relative z-10">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-inner">
                                    <Package className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
                                        {count}
                                    </span>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active</p>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
                                    Browse listings <ArrowRight className="w-3 h-3" />
                                </p>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                        </Link>
                    );
                })}
            </div>
        </div>

        {/* Form Section */}
        {(!currentUser || currentUser.role === 'HOUSEHOLD') && (
          <div className={`bg-white rounded-[2.5rem] shadow-sm border ${isEditing ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-100'} p-8 mb-16 relative overflow-hidden`}>
            {!token && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center">
                 <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm">
                    <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Want to post waste?</h3>
                    <p className="text-gray-500 text-sm font-medium mb-6">Create an account as a Household to publish your available pickups.</p>
                    <Link to="/login" className="block w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all">
                        Login to Continue
                    </Link>
                 </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 flex items-center">
                {isEditing ? <><Edit2 className="h-6 w-6 mr-3 text-emerald-600" />Update Request</> : <><Plus className="h-6 w-6 mr-3 text-emerald-600" />New Pickup Request</>}
              </h2>
              {isEditing && <button onClick={handleCancel} className="text-sm text-gray-400 hover:text-gray-600 flex items-center font-bold uppercase tracking-widest"><X className="h-4 w-4 mr-1" /> Cancel</button>}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Waste Category</label>
                <select name="category_id" required className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.category_id} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity {formData.category_id ? `(${categories.find(c => c.id === parseInt(formData.category_id))?.unit || 'Units'})` : ''}</label>
                <div className="relative">
                  <input type="number" step="0.1" name="quantity" required placeholder="e.g. 5.5" className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.quantity} onChange={handleChange} />
                  <Package className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                </div>
              </div>

              {/* Sellable / Price Logic */}
              <div className="md:col-span-2">
                {formData.category_id && (
                  <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${formData.is_sellable ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${formData.is_sellable ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-400'}`}>
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900">{formData.is_sellable ? 'Sellable Item' : 'Non-Sellable Item'}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formData.is_sellable ? 'You will be paid for this waste' : 'This category is for disposal only'}</p>
                      </div>
                    </div>
                    {formData.is_sellable ? (
                      <div className="text-right">
                        <label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] block mb-1">Expected Price (Rs)</label>
                        <div className="flex items-center gap-2">
                           <span className="text-xl font-black text-gray-900">Rs.</span>
                           <input 
                            type="number" 
                            name="estimated_price" 
                            step="0.01"
                            className="w-32 bg-white border-2 border-orange-200 rounded-xl px-4 py-2 font-black text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                            value={formData.estimated_price}
                            onChange={handleChange}
                            required
                           />
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Disposal Only
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Date</label>
                <div className="relative">
                  <input type="date" name="pickup_date" required className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.pickup_date} onChange={handleChange} />
                  <Calendar className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Time Range</label>
                <div className="grid grid-cols-2 gap-4">
                    <select name="startTime" required className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.startTime} onChange={handleChange}>
                        <option value="">Start</option>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                    <select name="endTime" required className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.endTime} onChange={handleChange}>
                        <option value="">End</option>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pickup Address</label>
                    <div className="flex gap-2">
                        <input type="text" name="address_line" required className="flex-1 px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.address_line} onChange={handleChange} />
                        <button type="button" onClick={handleFindOnMap} disabled={searchingMap} className="px-6 py-4 bg-emerald-100 text-emerald-700 font-black rounded-2xl hover:bg-emerald-200 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50">{searchingMap ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}Find on Map</button>
                    </div>
                </div>
                <div className="h-[300px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative z-0">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeView center={mapCenter} />
                        <MapController setPosition={setMapCenter} />
                    </MapContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                        <div className="w-8 h-8 border-2 border-emerald-600 rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-emerald-600 rounded-full"></div></div>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-[400]"><button type="button" onClick={handleConfirmLocation} disabled={fetchingAddress} className="bg-emerald-900 text-white px-8 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-800 transition-all active:scale-95">{fetchingAddress ? "Identifying..." : "Confirm Map Point"}</button></div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea name="description" rows="2" className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner resize-none" value={formData.description} onChange={handleChange}></textarea>
              </div>
              <div className="md:col-span-2 flex gap-4"><button type="submit" disabled={submitting} className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl active:scale-95 disabled:opacity-70">{submitting ? "Processing..." : (isEditing ? "Update" : "Post Request")}</button></div>
            </form>
          </div>
        )}
      </main>

      <style>{`
        @keyframes bounce-in {
          0% { transform: translateY(-20px); opacity: 0; }
          60% { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Waste;
