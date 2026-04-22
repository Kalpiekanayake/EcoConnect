import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Plus, Trash2, Loader2, AlertCircle, Tag, Calendar, FileText, Edit2, X, CheckCircle2, Package, MapPin, Clock, DollarSign, Lock, Eye, Database, ArrowRight, Navigation } from 'lucide-react';

// Map imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

// --- Map Marker Component ---
const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const Waste = () => {
  const [wastes, setWastes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Map state (default to Colombo, Sri Lanka or similar center)
  const [markerPos, setMarkerPos] = useState([6.9271, 79.8612]);

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

  // Sync markerPos to formData
  useEffect(() => {
    if (markerPos) {
        setFormData(prev => ({
            ...prev,
            latitude: markerPos[0],
            longitude: markerPos[1]
        }));
    }
  }, [markerPos]);

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
    
    // Auto-update is_sellable if category is selected
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

    // Time range handling
    if (name === 'startTime' || name === 'endTime') {
        const newStart = name === 'startTime' ? value : formData.startTime;
        const newEnd = name === 'endTime' ? value : formData.endTime;
        
        setFormData(prev => ({
            ...prev,
            [name]: value,
            time_slot: newStart && newEnd ? `${newStart} - ${newEnd}` : ''
        }));

        // Validation
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

  const handleEdit = (waste) => {
    setIsEditing(true);
    setEditId(waste.id);
    
    // Parse time_slot back to startTime and endTime
    const [start, end] = (waste.time_slot || "").split(" - ");
    
    setMarkerPos([waste.latitude || 6.9271, waste.longitude || 79.8612]);

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
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setMarkerPos([6.9271, 79.8612]);
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
    setError('');
    
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
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
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

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Browse Requests</h1>
            <p className="mt-2 text-gray-500 font-medium">Explore active pickup requests in your area.</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-3xl font-black text-emerald-600">{wastes.length}</span>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Active Requests</p>
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
                {isEditing ? (
                  <>
                    <Edit2 className="h-6 w-6 mr-3 text-emerald-600" />
                    Update Your Request
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 mr-3 text-emerald-600" />
                    New Pickup Request
                  </>
                )}
              </h2>
              {isEditing && (
                <button 
                  onClick={handleCancel}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center font-bold uppercase tracking-widest"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Waste Category</label>
                {categories.length === 0 ? (
                    <button
                        type="button"
                        onClick={seedCategories}
                        disabled={submitting}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
                    >
                        {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Database className="w-4 h-4" />}
                        Initialize Categories
                    </button>
                ) : (
                    <select
                        name="category_id"
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                        value={formData.category_id}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Quantity {formData.category_id ? `(${categories.find(c => c.id === parseInt(formData.category_id))?.unit || 'Units'})` : ''}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="quantity"
                    required
                    placeholder={formData.category_id ? (categories.find(c => c.id === parseInt(formData.category_id))?.unit === 'kg' ? "e.g. 5.5" : "e.g. 10") : "e.g. 5"}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                  <Package className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                </div>
                {formData.category_id && (
                  <p className="text-[10px] font-bold text-gray-400 mt-1 ml-1 italic">
                    {categories.find(c => c.id === parseInt(formData.category_id))?.unit === 'kg' 
                      ? 'Enter weight in kilograms' 
                      : 'Enter number of items'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="pickup_date"
                    required
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                    value={formData.pickup_date}
                    onChange={handleChange}
                  />
                  <Calendar className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Time Range</label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <select
                            name="startTime"
                            required
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner appearance-none"
                            value={formData.startTime}
                            onChange={handleChange}
                        >
                            <option value="">Start</option>
                            {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                        <Clock className="absolute left-4 top-4.5 h-5 w-5 text-gray-300 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            name="endTime"
                            required
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner appearance-none"
                            value={formData.endTime}
                            onChange={handleChange}
                        >
                            <option value="">End</option>
                            {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                        <Clock className="absolute left-4 top-4.5 h-5 w-5 text-gray-300 pointer-events-none" />
                        <div className="absolute right-4 top-4.5 text-[10px] font-black text-gray-300 pointer-events-none">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                {formData.time_slot && !error && (
                    <p className="text-[10px] font-bold text-emerald-600 mt-1 ml-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Selected Slot: {formData.time_slot}
                    </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pickup Address & Location</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="address_line"
                            required
                            placeholder="Enter your street, city and house number"
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                            value={formData.address_line}
                            onChange={handleChange}
                        />
                        <MapPin className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                    </div>
                </div>

                {/* Map Picker */}
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Navigation className="w-3 h-3" /> Pin location on map (Optional but Recommended)
                    </p>
                    <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-sm ring-1 ring-gray-100 relative z-0">
                        <MapContainer 
                            center={markerPos} 
                            zoom={13} 
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={markerPos} setPosition={setMarkerPos} />
                        </MapContainer>
                    </div>
                    <div className="flex gap-4 px-2">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-3 py-1 rounded-lg">Lat: {formData.latitude.toFixed(6)}</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-3 py-1 rounded-lg">Lng: {formData.longitude.toFixed(6)}</div>
                    </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                <textarea
                  name="description"
                  rows="2"
                  placeholder="Describe the items..."
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_sellable"
                      className="sr-only peer"
                      checked={formData.is_sellable}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-600 transition-colors">Mark as Sellable Waste</span>
                </label>
              </div>

              {formData.is_sellable && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estimated Price ($)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="estimated_price"
                      placeholder="0.00"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                      value={formData.estimated_price}
                      onChange={handleChange}
                    />
                    <DollarSign className="absolute left-4 top-4.5 h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 md:flex-none px-12 py-4 rounded-2xl font-black text-white shadow-xl transform transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 ${
                    isEditing ? 'bg-emerald-700 shadow-emerald-100' : 'bg-emerald-600 shadow-emerald-100'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Syncing...
                    </>
                  ) : (
                    isEditing ? 'Update Request' : 'Post My Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-black text-gray-900">Active Listings</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Feed
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-gray-50">
              <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
              <p className="text-gray-400 font-bold tracking-tight">Gathering requests...</p>
            </div>
          ) : wastes.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100 py-24 text-center">
              <div className="bg-[#FAF9F6] h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-200" />
              </div>
              <p className="text-gray-900 text-xl font-black">Nothing to see here yet</p>
              <p className="text-sm text-gray-400 mt-2 font-medium">Be the first to post a pickup request in your area!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {wastes.map((waste) => (
                <div 
                  key={waste.id} 
                  className={`group bg-white rounded-[2rem] p-8 shadow-sm border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${editId === waste.id ? 'border-emerald-500 bg-emerald-50/5' : 'border-white hover:border-emerald-50'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest w-fit text-center">
                        <Tag className="w-3 h-3 mr-2" />
                        {getCategoryName(waste.category_id)}
                        </span>
                        {waste.is_sellable && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-widest w-fit text-center">
                                <DollarSign className="w-3 h-3 mr-1" /> Sellable
                            </span>
                        )}
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      waste.status === 'OPEN' ? 'bg-white text-emerald-600 border-emerald-50' : 
                      waste.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {waste.status}
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-gray-600 text-sm font-medium leading-relaxed min-h-[40px] line-clamp-2">{waste.description || 'No description provided.'}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-900 font-black text-sm bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                        <Package className="w-4 h-4 mr-2 text-emerald-500" />
                        {waste.quantity} {categories.find(c => c.id === waste.category_id)?.unit || 'Units'}
                      </div>
                      <div className="flex items-center text-gray-500 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50 shadow-inner">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                        {waste.pickup_date}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                    <button 
                        onClick={() => openDetails(waste)}
                        className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                    >
                        <Eye className="w-4 h-4" /> View Details
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {/* Household actions */}
                        {token && currentUser && currentUser.id === waste.household_id && waste.status === 'OPEN' && (
                            <>
                                <button 
                                    onClick={() => handleEdit(waste)}
                                    className="p-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all shadow-sm"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(waste.id)}
                                    className="p-3 bg-white text-red-500 border border-red-50 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        
                        {/* Collector action */}
                        {token && currentUser && currentUser.role === 'COLLECTOR' && waste.status === 'OPEN' && (
                            <button 
                                onClick={() => handleBookPickup(waste.id)}
                                className="px-6 py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all active:scale-95"
                            >
                                Book
                            </button>
                        )}

                        {!token && (
                            <Link 
                                to="/login" 
                                state={{ from: { pathname: '/browse-requests' }, message: 'Sign in to book this pickup.' }}
                                className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest underline underline-offset-4"
                            >
                                Sign in to Book
                            </Link>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <RequestDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        categories={categories}
      />

      <style>{`
        @keyframes bounce-in {
          0% { transform: translateY(-20px); opacity: 0; }
          60% { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Waste;
