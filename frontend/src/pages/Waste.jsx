import { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, Trash2, Loader2, AlertCircle, Tag, Calendar, FileText, Edit2, X, CheckCircle2, Package, MapPin, Clock, DollarSign } from 'lucide-react';

const Waste = () => {
  const [wastes, setWastes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
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
        // UPDATE existing record
        const response = await API.put(`/wastes/${editId}`, payload);
        setWastes(wastes.map(w => w.id === editId ? response.data : w));
        setSuccess('Pickup request updated successfully!');
      } else {
        // CREATE new record
        const response = await API.post('/wastes', payload);
        setWastes([response.data, ...wastes]);
        setSuccess('New pickup request added!');
      }
      
      handleCancel(); // Reset form and exit edit mode
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Pickup Requests</h1>
            <p className="mt-2 text-sm text-gray-600">Request waste collection for your household.</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-2xl font-bold text-green-600">{wastes.length}</span>
            <p className="text-xs text-gray-400 uppercase font-semibold">Total Requests</p>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
          {success && (
            <div className="bg-green-600 text-white p-4 rounded-lg shadow-xl flex items-center animate-bounce-in">
              <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg shadow-xl flex items-center animate-bounce-in">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className={`bg-white rounded-2xl shadow-sm border ${isEditing ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'} p-6 mb-10 transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              {isEditing ? (
                <>
                  <Edit2 className="h-5 w-5 mr-2 text-blue-600" />
                  Update Pickup Request
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2 text-green-600" />
                  Create New Request
                </>
              )}
            </h2>
            {isEditing && (
              <button 
                onClick={handleCancel}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center font-medium"
              >
                <X className="h-4 w-4 mr-1" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Waste Category</label>
              <select
                name="category_id"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white shadow-sm"
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
              <label className="text-sm font-semibold text-gray-700 ml-1">Quantity</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="quantity"
                  required
                  placeholder="e.g. 5.5"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white shadow-sm"
                  value={formData.quantity}
                  onChange={handleChange}
                />
                <Package className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Pickup Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="pickup_date"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white shadow-sm"
                  value={formData.pickup_date}
                  onChange={handleChange}
                />
                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Time Slot</label>
              <div className="relative">
                <input
                  type="text"
                  name="time_slot"
                  required
                  placeholder="e.g. 09:00 AM - 12:00 PM"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white shadow-sm"
                  value={formData.time_slot}
                  onChange={handleChange}
                />
                <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Pickup Address</label>
              <div className="relative">
                <input
                  type="text"
                  name="address_line"
                  required
                  placeholder="Full pickup address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white shadow-sm"
                  value={formData.address_line}
                  onChange={handleChange}
                />
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Description (Optional)</label>
              <textarea
                name="description"
                rows="2"
                placeholder="Additional details..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-none bg-white shadow-sm"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_sellable"
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={formData.is_sellable}
                  onChange={handleChange}
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">Is Sellable Waste?</span>
              </label>
            </div>

            {formData.is_sellable && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-semibold text-gray-700 ml-1">Estimated Price</label>
                <div className="relative">
                  <input
                    type="number"
                    name="estimated_price"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none bg-white shadow-sm"
                    value={formData.estimated_price}
                    onChange={handleChange}
                  />
                  <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transform transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center ${
                  isEditing ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </>
                ) : (
                  isEditing ? 'Update Request' : 'Post Request'
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Recent Requests</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Fetching your requests...</p>
            </div>
          ) : wastes.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">No requests found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first pickup request above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {wastes.map((waste) => (
                <div 
                  key={waste.id} 
                  className={`group bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md hover:border-green-100 ${editId === waste.id ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
                      <Tag className="w-3 h-3 mr-1.5" />
                      {getCategoryName(waste.category_id)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      waste.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                      waste.status === 'BOOKED' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {waste.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="text-gray-600 text-sm line-clamp-2 h-10">{waste.description || 'No description provided.'}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-semibold">{waste.quantity} Units</span>
                      </div>
                      {waste.is_sellable && (
                        <div className="flex items-center text-emerald-600 font-bold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>${waste.estimated_price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{waste.pickup_date} at {waste.time_slot}</span>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="line-clamp-1">{waste.address_line}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-xs text-gray-400 font-medium">
                      Posted on {new Date(waste.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(waste)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(waste.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
