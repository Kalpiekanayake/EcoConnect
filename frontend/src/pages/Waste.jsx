import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, Trash2, Loader2, AlertCircle, Tag, Calendar, FileText, Edit2, X, CheckCircle2, Package, MapPin, Clock, DollarSign, Lock } from 'lucide-react';

const Waste = () => {
  const [wastes, setWastes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    category_id: '',
    quantity: '',
    pickup_date: '',
    time_slot: '',
    address_line: '',
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

  // Clear messages after 3 seconds
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleEdit = (waste) => {
    setIsEditing(true);
    setEditId(waste.id);
    setFormData({
      description: waste.description || '',
      category_id: waste.category_id.toString(),
      quantity: waste.quantity.toString(),
      pickup_date: waste.pickup_date,
      time_slot: waste.time_slot,
      address_line: waste.address_line,
      is_sellable: waste.is_sellable,
      estimated_price: waste.estimated_price ? waste.estimated_price.toString() : ''
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ 
      description: '', 
      category_id: '', 
      quantity: '', 
      pickup_date: '', 
      time_slot: '', 
      address_line: '', 
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

        {/* Form Section - Only if Household OR Not logged in (shows CTA) */}
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
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="quantity"
                    required
                    placeholder="e.g. 5.5"
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                  <Package className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                </div>
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time Slot</label>
                <div className="relative">
                  <input
                    type="text"
                    name="time_slot"
                    required
                    placeholder="e.g. 09:00 AM - 12:00 PM"
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-[#FAF9F6] font-bold text-gray-700 shadow-inner"
                    value={formData.time_slot}
                    onChange={handleChange}
                  />
                  <Clock className="absolute left-4 top-4.5 h-5 w-5 text-gray-300" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pickup Address</label>
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
                      <Loader2 className="animate-spin h-5 w-5" />
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
            <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 py-24 text-center">
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
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest w-fit">
                        <Tag className="w-3 h-3 mr-2" />
                        {getCategoryName(waste.category_id)}
                        </span>
                        {waste.is_sellable && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-widest w-fit">
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
                    <p className="text-gray-600 text-sm font-medium leading-relaxed min-h-[40px]">{waste.description || 'No description provided.'}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-900 font-black text-sm bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50">
                        <Package className="w-4 h-4 mr-2 text-emerald-500" />
                        {waste.quantity} Units
                      </div>
                      {waste.is_sellable && (
                        <div className="flex items-center text-emerald-700 font-black text-sm bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${waste.estimated_price}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-gray-500 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50">
                      <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                      {waste.pickup_date} <span className="mx-2 text-gray-200">|</span> <Clock className="w-4 h-4 mr-2 text-emerald-500" /> {waste.time_slot}
                    </div>

                    <div className="flex items-start text-gray-500 text-xs font-bold bg-[#FAF9F6] p-3 rounded-2xl border border-gray-50">
                      <MapPin className="w-4 h-4 mr-2 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{waste.address_line}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
                      ID #{waste.id.toString().padStart(4, '0')}
                    </div>
                    
                    {/* Actions - Only if owner AND logged in */}
                    {token && currentUser && currentUser.id === waste.household_id && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleEdit(waste)}
                                className="p-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all shadow-sm"
                                title="Edit Request"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(waste.id)}
                                className="p-3 bg-white text-red-500 border border-red-50 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                                title="Delete Request"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    
                    {/* Collector Action - If collector AND logged in */}
                    {token && currentUser && currentUser.role === 'COLLECTOR' && waste.status === 'OPEN' && (
                        <button className="px-6 py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all active:scale-95">
                            Book Pickup
                        </button>
                    )}

                    {!token && (
                        <Link 
                            to="/login" 
                            state={{ from: { pathname: '/browse-requests' }, message: 'Sign in to book this pickup.' }}
                            className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest underline underline-offset-4"
                        >
                            Sign in to Book
                        </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
