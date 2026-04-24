import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Plus, Trash2, Loader2, AlertCircle, Tag, Calendar, FileText, Edit2, X, CheckCircle2, Package, MapPin, Clock, DollarSign, Lock, Eye, ArrowRight, Navigation, Truck } from 'lucide-react';

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

// --- Category Visual Mapping ---
const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { icon: '🥥', color: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700' },
    'Coconut Husks': { icon: '🌴', color: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
    'Plastic': { icon: '🥤', color: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
    'Glass': { icon: '🍾', color: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
    'Paper/Cardboard': { icon: '📦', color: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
    'Food Waste': { icon: '🍎', color: 'bg-red-50', border: 'border-red-100', text: 'text-red-700' },
    'General Disposal': { icon: '🗑️', color: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700' },
  };
  return styles[name] || { icon: '♻️', color: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' };
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
  const location = useLocation();

  // Map state (default to Colombo, Sri Lanka)
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    category_id: '',
    quantity: '',
    unit: 'kg',
    pickup_date: '',
    startTime: '',
    endTime: '',
    time_slot: '',
    address_line: '',
    latitude: 6.9271,
    longitude: 79.8612,
    is_sellable: false,
    price: ''
  });

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

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

  const handleEdit = (waste) => {
    setIsEditing(true);
    setEditId(waste.id);
    setMapCenter([waste.latitude || 6.9271, waste.longitude || 79.8612]);
    
    let start = "";
    let end = "";
    if (waste.time_slot && waste.time_slot.includes(" - ")) {
        [start, end] = waste.time_slot.split(" - ");
    }

    setFormData({
      description: waste.description || '',
      category_id: waste.category_id.toString(),
      quantity: waste.quantity.toString(),
      unit: waste.unit || 'kg',
      pickup_date: waste.pickup_date,
      startTime: start,
      endTime: end,
      time_slot: waste.time_slot,
      address_line: waste.address_line,
      latitude: waste.latitude || 6.9271,
      longitude: waste.longitude || 79.8612,
      is_sellable: waste.is_sellable || false,
      price: (waste.price || waste.estimated_price || '').toString()
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchInitialData();
    if (token) {
        API.get('/auth/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
    
    // Check if we came here to edit a request
    if (location.state?.editRequest) {
        handleEdit(location.state.editRequest);
    }
  }, [token, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category_id' && value !== '') {
        const selectedCat = categories.find(c => c.id === parseInt(value));
        if (selectedCat) {
            setFormData(prev => ({
                ...prev,
                category_id: value,
                is_sellable: selectedCat.is_sellable,
                unit: selectedCat.unit || 'kg',
                price: selectedCat.is_sellable ? (prev.quantity ? (parseFloat(prev.quantity) * (selectedCat.base_price_per_unit || 0)).toFixed(2) : '') : ''
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
      unit: 'kg',
      pickup_date: '', 
      startTime: '',
      endTime: '',
      time_slot: '', 
      address_line: '', 
      latitude: 6.9271,
      longitude: 79.8612,
      is_sellable: false, 
      price: '' 
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
      const parsedPrice = formData.is_sellable ? parseFloat(formData.price) : 0;
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        quantity: parseFloat(formData.quantity),
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        estimated_price: isNaN(parsedPrice) ? 0 : parsedPrice
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
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Total Jobs</p>
            <p className="text-2xl font-black text-emerald-700">{wastes.length}</p>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
          {success && (
            <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-emerald-500/50 backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
              <CheckCircle2 className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-red-500/50 backdrop-blur-md animate-in slide-in-from-right-10 duration-300">
              <AlertCircle className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {/* Category Selection Grid */}
        <div className="mb-20">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-1 bg-emerald-600 rounded-full"></div>
                Waste Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat) => {
                    const count = wastes.filter(w => w.category_id === cat.id && w.status === 'OPEN').length;
                    const style = getCategoryStyles(cat.name);
                    return (
                        <Link 
                            key={cat.id} 
                            to={`/browse-requests/${cat.id}`}
                            className="p-10 rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200 hover:-translate-y-1 active:scale-[0.98] group flex flex-col justify-between h-56 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start relative z-10">
                                <div className={`p-4 ${style.color} ${style.text} rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm border border-emerald-100/50 text-4xl flex items-center justify-center w-20 h-20`}>
                                    {style.icon}
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
                                        {count}
                                    </span>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Active</p>
                                </div>
                            </div>
                            <div className="relative z-10 mt-6">
                                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                                    Browse listings <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>

        {/* Form Section */}
        {(!currentUser || currentUser.role === 'HOUSEHOLD') && (
          <div className={`bg-white rounded-[2.5rem] shadow-sm border-2 ${isEditing ? 'border-emerald-200 bg-emerald-50/5' : 'border-gray-50'} p-10 md:p-12 mb-16 relative overflow-hidden`}>
            {!token && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center p-6 text-center">
                 <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-gray-100 max-w-md">
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 border border-emerald-100/50">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">Want to post waste?</h3>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">Create an account as a Household to publish your available pickups and start contributing to a greener future.</p>
                    <Link to="/login" className="block w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                        Sign In to Continue
                    </Link>
                 </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-gray-900 flex items-center tracking-tight">
                {isEditing ? <><Edit2 className="h-8 w-8 mr-4 text-emerald-600" />Update Your Request</> : <><Plus className="h-8 w-8 mr-4 text-emerald-600" />Post a Pickup</>}
              </h2>
              {isEditing && <button onClick={handleCancel} className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"><X className="h-5 w-5" /></button>}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Waste Category</label>
                <select name="category_id" required className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 font-bold text-gray-700 shadow-sm" value={formData.category_id} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Quantity</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type="number" step="0.1" name="quantity" required placeholder="e.g. 5.5" className="w-full pl-12 pr-6 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 font-bold text-gray-700 shadow-sm" value={formData.quantity} onChange={handleChange} />
                    <Package className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  </div>
                  {(formData.category_id && (categories.find(c => c.id === parseInt(formData.category_id))?.name.includes('Coconut'))) ? (
                    <select name="unit" className="w-32 px-4 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 font-bold text-gray-700 shadow-sm" value={formData.unit} onChange={handleChange}>
                        <option value="kg">kg</option>
                        <option value="pieces">pieces</option>
                    </select>
                  ) : (
                    <div className="w-32 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 font-bold text-gray-400 text-xs uppercase tracking-widest">
                        {formData.unit}
                    </div>
                  )}
                </div>
              </div>

              {/* Sellable / Price Logic - Modern Toggle */}
              <div className="md:col-span-2">
                <div className={`p-10 rounded-3xl border-2 transition-all ${formData.is_sellable ? 'bg-emerald-50/50 border-emerald-100 shadow-lg shadow-emerald-900/5' : 'bg-gray-50/50 border-gray-100'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className={`p-5 rounded-2xl shadow-sm border ${formData.is_sellable ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white text-gray-400 border-gray-100'}`}>
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 tracking-tight">Is this sellable?</h4>
                        <p className="text-sm font-medium text-gray-500 mt-1">Get paid for recyclables like coconut shells and plastic.</p>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_sellable: !prev.is_sellable, price: !prev.is_sellable ? prev.price : '' }))}
                      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none ${formData.is_sellable ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform duration-300 shadow-md ${formData.is_sellable ? 'translate-x-11' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {formData.is_sellable && (
                    <div className="mt-10 pt-10 border-t border-emerald-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div>
                        <p className="text-lg font-bold text-gray-900">Set your price</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-1">Based on current market rates in your area</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm w-full sm:w-auto">
                        <span className="pl-4 font-black text-gray-400">Rs.</span>
                        <input 
                          type="number" 
                          name="price" 
                          step="0.01"
                          placeholder="0.00"
                          className="w-full sm:w-36 bg-transparent border-none focus:ring-0 font-black text-2xl text-gray-900"
                          value={formData.price}
                          onChange={handleChange}
                          required={formData.is_sellable}
                        />
                        <div className="bg-emerald-50 px-5 py-2.5 rounded-xl text-[10px] font-bold text-emerald-600 uppercase tracking-widest whitespace-nowrap">
                          Per {formData.unit}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Preferred Pickup Date</label>
                <div className="relative">
                  <input type="date" name="pickup_date" required className="w-full pl-12 pr-6 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 font-bold text-gray-700 shadow-sm" value={formData.pickup_date} onChange={handleChange} />
                  <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Time Availability Window</label>
                <div className="grid grid-cols-2 gap-4">
                    <select name="startTime" required className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 font-bold text-gray-700 shadow-sm" value={formData.startTime} onChange={handleChange}>
                        <option value="">Start</option>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                    <select name="endTime" required className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 font-bold text-gray-700 shadow-sm" value={formData.endTime} onChange={handleChange}>
                        <option value="">End</option>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Pickup Address</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" name="address_line" required className="flex-1 px-6 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 font-bold text-gray-700 shadow-sm" value={formData.address_line} onChange={handleChange} />
                        <button type="button" onClick={handleFindOnMap} disabled={searchingMap} className="px-8 py-4 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50">{searchingMap ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}Find on Map</button>
                    </div>
                </div>
                <div className="h-[350px] w-full rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner relative z-0">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeView center={mapCenter} />
                        <MapController setPosition={setMapCenter} />
                    </MapContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                        <div className="w-10 h-10 border-4 border-emerald-600 rounded-full flex items-center justify-center bg-emerald-600/10 backdrop-blur-[2px] shadow-2xl animate-pulse"><div className="w-1.5 h-1.5 bg-emerald-600 rounded-full shadow-sm"></div></div>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[400] px-6"><button type="button" onClick={handleConfirmLocation} disabled={fetchingAddress} className="bg-gray-900 text-white px-10 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95">{fetchingAddress ? "Identifying Location..." : "Lock Map Position"}</button></div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Additional Details</label>
                <textarea name="description" rows="3" placeholder="Describe access points, specific items, or any other helpful info..." className="w-full px-6 py-4 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-gray-50 font-semibold text-gray-700 shadow-sm resize-none placeholder:text-gray-300" value={formData.description} onChange={handleChange}></textarea>
              </div>
              <div className="md:col-span-2 flex gap-4 pt-4">
                 <button type="submit" disabled={submitting} className="flex-1 sm:flex-none px-16 py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-70 transition-all text-lg">
                    {submitting ? "Processing..." : (isEditing ? "Save Changes" : "Post Pickup Request")}
                 </button>
              </div>
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
