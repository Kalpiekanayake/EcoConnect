import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Plus, Trash2, Loader2, AlertCircle, Tag, Calendar, FileText, Edit2, X, CheckCircle2, Package, MapPin, Clock, DollarSign, Lock, Eye, ArrowRight, Navigation, Truck, PlusCircle, Sprout, Info } from 'lucide-react';

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
    'Coconut Shells': { icon: '🥥', color: 'bg-orange-50/50', border: 'border-orange-100', text: 'text-orange-700' },
    'Coconut Husks': { icon: '🌴', color: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-700' },
    'Plastic': { icon: '🥤', color: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700' },
    'Glass': { icon: '🍾', color: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700' },
    'Paper/Cardboard': { icon: '📦', color: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-700' },
    'Food Waste': { icon: '🍎', color: 'bg-red-50/50', border: 'border-red-100', text: 'text-red-700' },
    'General Disposal': { icon: '🗑️', color: 'bg-stone-50/50', border: 'border-stone-100', text: 'text-stone-700' },
  };
  return styles[name] || { icon: '♻️', color: 'bg-primary/5', border: 'border-primary/10', text: 'text-primary' };
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
        <div className="min-h-screen bg-off-white">
            <Navbar />
            <main className="container-custom py-16 pt-40">
                <div className="mb-12">
                    <div className="h-10 w-48 bg-stone-100 rounded-lg animate-pulse mb-3"></div>
                    <div className="h-5 w-64 bg-stone-50 rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-white rounded-3xl border border-border-light animate-pulse"></div>)}
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white font-sans">
      <Navbar />
      
      <main className="container-custom py-16 pt-40">
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 animate-fade-up">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soft-mint border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sprout className="w-3 h-3" /> Professional Waste Streams
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark-slate tracking-tight leading-tight">
              Service <span className="text-primary">Categories</span>
            </h1>
            <p className="mt-4 text-lg text-muted-gray font-medium max-w-xl">Browse active requests by material stream or initiate a professional recovery request for your household.</p>
          </div>
          <div className="bg-white px-8 py-5 rounded-3xl border border-border-light shadow-corporate hidden sm:block text-center min-w-[160px]">
            <p className="text-[10px] text-muted-gray font-bold uppercase tracking-[0.2em] mb-2">Active Jobs</p>
            <p className="text-4xl font-extrabold text-primary tracking-tighter">{wastes.filter(w => w.status === 'OPEN').length}</p>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-24 right-4 z-[2000] space-y-4 max-w-sm w-full px-4 sm:px-0">
          {success && (
            <div className="bg-primary text-white p-5 rounded-2xl shadow-2xl flex items-center border border-white/20 backdrop-blur-md animate-fade-up">
              <CheckCircle2 className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-2xl flex items-center border border-white/20 backdrop-blur-md animate-fade-up">
              <AlertCircle className="h-6 w-6 mr-4 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {/* Category Selection Grid */}
        <div className="mb-32">
            <div className="flex items-center gap-4 mb-12 animate-fade-up">
                <div className="w-10 h-1 bg-primary rounded-full"></div>
                <h2 className="text-xl font-extrabold text-dark-slate uppercase tracking-wider">Select Material Stream</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                {categories.map((cat) => {
                    const count = wastes.filter(w => w.category_id === cat.id && w.status === 'OPEN').length;
                    const style = getCategoryStyles(cat.name);
                    return (
                        <Link 
                            key={cat.id} 
                            to={`/browse-requests/${cat.id}`}
                            className="p-10 rounded-[2.5rem] bg-white border border-border-light shadow-corporate hover:shadow-corporate-lg hover:border-primary/20 hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between h-72 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start relative z-10">
                                <div className={`w-20 h-20 ${style.color} ${style.text} rounded-3xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-3`}>
                                    {style.icon}
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-extrabold text-dark-slate group-hover:text-primary transition-colors tracking-tighter">
                                        {count}
                                    </span>
                                    <p className="text-[9px] font-bold text-muted-gray uppercase tracking-[0.2em] mt-1">Available</p>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-extrabold text-dark-slate tracking-tight group-hover:text-primary transition-colors">
                                    {cat.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-muted-gray group-hover:text-primary transition-colors">
                                    Audit listings <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>

        {/* Form Section */}
        {(!currentUser || currentUser.role === 'HOUSEHOLD') && (
          <div className={`bg-white rounded-[3.5rem] shadow-corporate-xl border border-border-light p-10 md:p-20 mb-32 relative overflow-hidden animate-fade-up`} style={{ animationDelay: '0.2s' }}>
            {!token && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xl z-10 flex items-center justify-center p-8 text-center transition-all">
                 <div className="bg-white p-12 rounded-[3rem] shadow-corporate-xl border border-border-light max-w-lg animate-fade-up">
                    <div className="bg-soft-mint w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/10 shadow-inner">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-dark-slate mb-4 tracking-tight">Professional Access Required</h3>
                    <p className="text-muted-gray font-medium mb-10 text-lg">Sign in to your household portal to list materials and track your environmental contribution.</p>
                    <Link to="/login" className="btn-primary w-full py-5 text-lg">
                        Sign In to Start
                    </Link>
                 </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-dark-slate tracking-tight flex items-center gap-4">
                  {isEditing ? <><Edit2 className="h-8 w-8 text-amber-500" /> Modify Listing</> : <><PlusCircle className="h-8 w-8 text-primary" /> Professional Listing</>}
                </h2>
                <p className="text-muted-gray font-medium mt-2">Provide accurate material details for our specialized collectors.</p>
              </div>
              {isEditing && (
                <button onClick={handleCancel} className="btn-outline py-3 px-6 text-sm text-red-600 hover:bg-red-50 hover:border-red-100">
                  <X className="h-4 w-4" /> Cancel Modification
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest ml-1 block">Material Category</label>
                <select name="category_id" required className="w-full px-6 py-5 rounded-2xl border border-border-light focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-stone-50/50 font-bold text-dark-slate shadow-sm hover:bg-white appearance-none cursor-pointer" value={formData.category_id} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest ml-1 block">Documented Quantity</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input type="number" step="0.1" name="quantity" required placeholder="0.00" className="w-full pl-14 pr-6 py-5 rounded-2xl border border-border-light focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-stone-50/50 font-bold text-dark-slate shadow-sm hover:bg-white" value={formData.quantity} onChange={handleChange} />
                    <Package className="absolute left-5 top-5.5 h-5 w-5 text-muted-gray" />
                  </div>
                  {(formData.category_id && (categories.find(c => c.id === parseInt(formData.category_id))?.name.includes('Coconut'))) ? (
                    <select name="unit" className="w-36 px-4 py-5 rounded-2xl border border-border-light focus:ring-2 focus:ring-primary outline-none bg-stone-50/50 font-bold text-dark-slate shadow-sm hover:bg-white cursor-pointer" value={formData.unit} onChange={handleChange}>
                        <option value="kg">kg</option>
                        <option value="pieces">pieces</option>
                    </select>
                  ) : (
                    <div className="w-36 flex items-center justify-center bg-stone-50/50 rounded-2xl border border-border-light font-bold text-muted-gray text-[10px] uppercase tracking-widest">
                        {formData.unit}
                    </div>
                  )}
                </div>
              </div>

              {/* Sellable / Price Logic - Modern Toggle */}
              <div className="md:col-span-2">
                <div className={`p-10 rounded-[2.5rem] border-2 transition-all duration-500 ${formData.is_sellable ? 'bg-soft-mint border-primary/20 shadow-inner' : 'bg-stone-50/50 border-border-light shadow-inner'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl shadow-sm border transition-all duration-500 flex items-center justify-center ${formData.is_sellable ? 'bg-primary text-white border-primary scale-110' : 'bg-white text-muted-gray border-border-light'}`}>
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-extrabold text-dark-slate tracking-tight">Marketable Material?</h4>
                        <p className="text-sm font-medium text-muted-gray mt-1">Enable for recyclables that hold local market value.</p>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_sellable: !prev.is_sellable, price: !prev.is_sellable ? prev.price : '' }))}
                      className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-500 focus:outline-none ${formData.is_sellable ? 'bg-primary' : 'bg-stone-200'}`}
                    >
                      <span className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform duration-500 shadow-md ${formData.is_sellable ? 'translate-x-13' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {formData.is_sellable && (
                    <div className="mt-10 pt-10 border-t border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 animate-fade-up">
                      <div>
                        <p className="text-lg font-extrabold text-dark-slate">Valuation Request</p>
                        <p className="text-xs font-bold text-primary mt-1 uppercase tracking-widest flex items-center gap-2"><Info className="w-3 h-3" /> Market reference rates applied</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-primary/20 shadow-sm w-full sm:w-auto">
                        <span className="pl-4 font-extrabold text-stone-300 text-xl">LKR</span>
                        <input 
                          type="number" 
                          name="price" 
                          step="0.01"
                          placeholder="0.00"
                          className="w-full sm:w-40 bg-transparent border-none focus:ring-0 font-extrabold text-3xl text-dark-slate placeholder:text-stone-100"
                          value={formData.price}
                          onChange={handleChange}
                          required={formData.is_sellable}
                        />
                        <div className="bg-soft-mint px-5 py-3 rounded-xl text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap border border-primary/10">
                          Per {formData.unit}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest ml-1 block">Scheduled Collection Date</label>
                <div className="relative">
                  <input type="date" name="pickup_date" required className="w-full pl-14 pr-6 py-5 rounded-2xl border border-border-light focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-stone-50/50 font-bold text-dark-slate shadow-sm hover:bg-white" value={formData.pickup_date} onChange={handleChange} />
                  <Calendar className="absolute left-5 top-5.5 h-5 w-5 text-muted-gray" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest ml-1 block">Time Availability Window</label>
                <div className="grid grid-cols-2 gap-4">
                    <select name="startTime" required className="w-full px-6 py-5 rounded-2xl border border-border-light focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-stone-50/50 font-bold text-dark-slate shadow-sm hover:bg-white appearance-none cursor-pointer" value={formData.startTime} onChange={handleChange}>
                        <option value="">Start</option>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                    <select name="endTime" required className="w-full px-6 py-5 rounded-2xl border border-border-light focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-stone-50/50 font-bold text-dark-slate shadow-sm hover:bg-white appearance-none cursor-pointer" value={formData.endTime} onChange={handleChange}>
                        <option value="">End</option>
                        {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest ml-1 block">Logistics Point (Pickup Address)</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" name="address_line" required className="flex-1 px-6 py-5 rounded-2xl border border-border-light focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-stone-50/50 font-bold text-dark-slate shadow-sm hover:bg-white" value={formData.address_line} onChange={handleChange} />
                        <button type="button" onClick={handleFindOnMap} disabled={searchingMap} className="btn-secondary py-5 px-10 whitespace-nowrap">
                           {searchingMap ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />} Find Coordinates
                        </button>
                    </div>
                </div>
                <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden border-[12px] border-stone-50 shadow-inner relative z-0">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeView center={mapCenter} />
                        <MapController setPosition={setMapCenter} />
                    </MapContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                        <div className="w-10 h-10 border-4 border-primary rounded-full flex items-center justify-center bg-primary/10 backdrop-blur-[1px] shadow-2xl animate-pulse"><div className="w-2 h-2 bg-primary rounded-full shadow-sm"></div></div>
                    </div>
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center z-[400] px-6">
                      <button type="button" onClick={handleConfirmLocation} disabled={fetchingAddress} className="bg-dark-slate text-white px-12 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95 border border-white/10 backdrop-blur-md">
                        {fetchingAddress ? "Syncing Location..." : "Confirm Logistics Position"}
                      </button>
                    </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest ml-1 block">Audit Notes / Additional Details</label>
                <textarea name="description" rows="5" placeholder="Include access instructions, material conditions, or sorting details..." className="w-full px-8 py-6 rounded-3xl border border-border-light focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-stone-50/50 font-medium text-dark-slate shadow-sm resize-none placeholder:text-stone-200 hover:bg-white" value={formData.description} onChange={handleChange}></textarea>
              </div>
              <div className="md:col-span-2 flex pt-10">
                 <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto py-6 px-16 text-xl shadow-corporate-lg">
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (isEditing ? <CheckCircle2 className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />)}
                    {submitting ? "Processing..." : (isEditing ? "Apply Changes" : "Post Recovery Request")}
                 </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Waste;

