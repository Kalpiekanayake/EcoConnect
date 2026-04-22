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
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      console.error(err);
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
        console.error("Geocoding error", err);
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
            setSuccess("Location confirmed and address updated!");
        }
    } catch (err) {
        console.error("Failed to fetch address", err);
        setFormData(prev => ({
            ...prev,
            latitude: mapCenter[0],
            longitude: mapCenter[1]
        }));
        setError("Could not fetch address, but coordinates are saved.");
    } finally {
        setFetchingAddress(false);
    }
  };

  const handleEdit = (waste) => {
    setIsEditing(true);
    setEditId(waste.id);
    const [start, end] = (waste.time_slot || "").split(" - ");
    const newPos = [waste.latitude || 6.9271, waste.longitude || 79.8612];
    setMapCenter(newPos);
    setFormData({
      description: waste.description || '',
      category_id: waste.category_id.toString(),
      quantity: waste.quantity.toString(),
      pickup_date: waste.pickup_date,
      startTime: start || '',
      endTime: end || '',
      time_slot: waste.time_slot,
      address_line: waste.address_line,
      latitude: waste.latitude || 6.9271,
      longitude: waste.longitude || 79.8612,
      is_sellable: waste.is_sellable,
      estimated_price: waste.estimated_price ? waste.estimated_price.toString() : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        navigate('/login', { state: { from: { pathname: '/browse-requests' }, message: 'Please login to post a pickup request.' } });
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
        description: formData.description,
        category_id: parseInt(formData.category_id),
        quantity: parseFloat(formData.quantity),
        pickup_date: formData.pickup_date,
        time_slot: formData.time_slot,
        address_line: formData.address_line,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        is_sellable: formData.is_sellable,
        estimated_price: formData.is_sellable ? parseFloat(formData.estimated_price || 0) : 0
      };
      if (isEditing) {
        const response = await API.put(`/wastes/${editId}`, payload);
        setWastes(wastes.map(w => w.id === editId ? response.data : w));
        setSuccess('Pickup request updated successfully!');
      } else {
        const response = await API.post('/wastes', payload);
        setWastes([response.data, ...wastes]);
        setSuccess('New pickup request added!');
      }
      handleCancel();
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await API.delete(`/wastes/${id}`);
        setWastes(wastes.filter(w => w.id !== id));
        setSuccess('Record deleted successfully');
      } catch (err) {
        setError('Failed to delete the record');
      }
    }
  };

  const handleBookPickup = async (id) => {
    if (!token) {
        navigate('/login', { state: { from: { pathname: '/browse-requests' }, message: 'Please login to book pickups.' } });
        return;
    }
    if (currentUser?.role !== 'COLLECTOR') {
        setError("Only collectors can book pickups.");
        return;
    }
    try {
        const response = await API.patch(`/wastes/${id}/book`);
        setWastes(wastes.map(w => w.id === id ? response.data : w));
        setSuccess("Pickup booked successfully!");
    } catch (err) {
        setError(err.response?.data?.detail || "Failed to book pickup.");
    }
  };

  const openDetails = (waste) => {
    setSelectedRequest(waste);
    setIsModalOpen(true);
  };

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Unknown';
  };

  // Filtering Logic
  const filteredWastes = selectedCategory === 'All' 
    ? wastes 
    : wastes.filter(w => getCategoryName(w.category_id) === selectedCategory);

  const getCountForCategory = (catName) => {
    if (catName === 'All') return wastes.length;
    return wastes.filter(w => getCategoryName(w.category_id) === catName).length;
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Browse Requests</h1>
            <p className="mt-2 text-gray-500 font-medium">Explore active pickup requests in your area.</p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 hidden sm:block shadow-sm text-center min-w-[120px]">
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">Matches</p>
            <p className="text-2xl font-black text-emerald-700">{filteredWastes.length}</p>
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
                    <Link to="/login" state={{ from: { pathname: '/browse-requests' }, message: 'Sign in to create your first pickup request.' }} className="block w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all">
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
                {categories.length === 0 ? <button type="button" onClick={seedCategories} disabled={submitting} className="w-full px-5 py-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all">{submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Database className="w-4 h-4" />}Initialize Categories</button> : (
                    <select name="category_id" required className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.category_id} onChange={handleChange}>
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity {formData.category_id ? `(${categories.find(c => c.id === parseInt(formData.category_id))?.unit || 'Units'})` : ''}</label>
                <div className="relative">
                  <input type="number" step="0.1" name="quantity" required placeholder={formData.category_id ? (categories.find(c => c.id === parseInt(formData.category_id))?.unit === 'kg' ? "e.g. 5.5" : "e.g. 10") : "e.g. 5"} className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner" value={formData.quantity} onChange={handleChange} />
                  <Package className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                </div>
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

        {/* List Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-black text-gray-900">Active Listings</h2>
          </div>
          
          {/* Category Filter Boxes */}
          <div className="mb-12 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-w-[600px] md:min-w-0">
                  <button onClick={() => setSelectedCategory('All')} className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between h-36 active:scale-95 relative overflow-hidden ${selectedCategory === 'All' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'}`}>
                      <div className="flex justify-between items-start relative z-10"><div className={`p-2.5 rounded-xl ${selectedCategory === 'All' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}><Truck className="w-5 h-5" /></div><span className={`text-xl font-black ${selectedCategory === 'All' ? 'text-white' : 'text-gray-900'}`}>{wastes.length}</span></div>
                      <div className="relative z-10"><p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Browse</p><h3 className={`text-sm font-black leading-tight ${selectedCategory === 'All' ? 'text-white' : 'text-gray-900'}`}>All Requests</h3></div>
                  </button>
                  {categories.map((cat) => {
                      const count = getCountForCategory(cat.name);
                      const isActive = selectedCategory === cat.name;
                      return (
                          <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between h-36 active:scale-95 relative overflow-hidden ${isActive ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'}`}>
                              <div className="flex justify-between items-start relative z-10"><div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}><Package className="w-5 h-5" /></div><span className={`text-xl font-black ${isActive ? 'text-white' : 'text-gray-900'}`}>{count}</span></div>
                              <div className="relative z-10"><p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Category</p><h3 className={`text-sm font-black leading-tight ${isActive ? 'text-white' : 'text-gray-900'} line-clamp-1`}>{cat.name}</h3></div>
                          </button>
                      );
                  })}
              </div>
          </div>

          {loading ? <div className="py-24 text-center text-gray-400 font-bold">Gathering requests...</div> : filteredWastes.length === 0 ? <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100 py-24 text-center font-black text-gray-300 uppercase tracking-widest">No matching requests</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredWastes.map((waste) => (
                <div key={waste.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{getCategoryName(waste.category_id)}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{waste.status}</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-6 line-clamp-2">{waste.description || "No description"}</p>
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <button onClick={() => openDetails(waste)} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">View Details</button>
                    {token && currentUser?.role === 'COLLECTOR' && waste.status === 'OPEN' && <button onClick={() => handleBookPickup(waste.id)} className="px-6 py-2 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all">Book</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <RequestDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} request={selectedRequest} categories={categories} />
    </div>
  );
};

export default Waste;
