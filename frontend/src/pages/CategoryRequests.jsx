import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { Tag, Calendar, MapPin, Package, Clock, Loader2, DollarSign, Lock, Eye, Truck, CheckCircle2, Edit2, TrendingUp, Info } from 'lucide-react';

// Category Images
import shellImg from '../assets/categories/coconut-shells.jpg';
import huskImg from '../assets/categories/coconut-husks.jpg';
import plasticImg from '../assets/categories/plastic.jpg';
import glassImg from '../assets/categories/glass.jpg';
import paperImg from '../assets/categories/paper.jpg';
import foodImg from '../assets/categories/food.jpg';
import generalImg from '../assets/categories/general.jpg';

// --- Category Visual Mapping ---
const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { image: shellImg, color: 'bg-orange-50/50', border: 'border-orange-100', text: 'text-orange-700' },
    'Coconut Husks': { image: huskImg, color: 'bg-amber-50/50', border: 'border-amber-100', text: 'text-amber-700' },
    'Plastic': { image: plasticImg, color: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700' },
    'Glass': { image: glassImg, color: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-700' },
    'Paper/Cardboard': { image: paperImg, color: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-700' },
    'Food Waste': { image: foodImg, color: 'bg-red-50/50', border: 'border-red-100', text: 'text-red-700' },
    'General Disposal': { image: generalImg, color: 'bg-stone-50/50', border: 'border-stone-100', text: 'text-stone-700' },
  };
  return styles[name] || { image: generalImg, color: 'bg-primary/5', border: 'border-primary/10', text: 'text-primary' };
};

const CategoryRequests = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [token] = useState(localStorage.getItem("token"));

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wasteRes, catRes] = await Promise.all([
        API.get('/wastes'),
        API.get('/categories')
      ]);
      
      const allCategories = catRes.data;
      setCategories(allCategories);
      
      const currentCat = allCategories.find(c => c.id === parseInt(categoryId));
      setCategory(currentCat);

      const filtered = wasteRes.data.filter(r => r.category_id === parseInt(categoryId));
      setRequests(filtered.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError('Failed to load requests for this category.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (token) {
        API.get('/auth/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, [categoryId, token]);

  const handleBookPickup = async (id) => {
    if (!token) {
        navigate('/login', { state: { from: { pathname: `/browse-requests/${categoryId}` }, message: 'Please login to book pickups.' } });
        return;
    }

    if (currentUser?.role !== 'COLLECTOR') {
        setError("Only registered Collectors can book pickups.");
        return;
    }

    try {
      await API.patch(`/wastes/${id}/book`);
      setSuccess('Pickup job assigned successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book pickup.');
    }
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white">
        <Navbar />
        <main className="container-custom py-16 pt-40">
          <div className="mb-12">
             <div className="h-6 w-32 bg-stone-100 rounded animate-pulse mb-8"></div>
             <div className="flex gap-8 items-center">
                <div className="w-28 h-28 bg-stone-100 rounded-3xl animate-pulse"></div>
                <div className="flex-1">
                   <div className="h-10 w-64 bg-stone-100 rounded animate-pulse mb-3"></div>
                   <div className="h-5 w-48 bg-stone-50 rounded animate-pulse"></div>
                </div>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-96 bg-white rounded-[2.5rem] border border-border-light animate-pulse"></div>)}
          </div>
        </main>
      </div>
    );
  }

  const categoryStyle = getCategoryStyles(category?.name);

  return (
    <div className="min-h-screen bg-off-white font-sans">
      <Navbar />
      
      <main className="container-custom py-16 pt-40">
        {/* Header */}
        <div className="mb-16 animate-fade-up">
          <Link to="/browse-requests" className="inline-flex items-center text-xs font-bold text-muted-gray hover:text-primary transition-all gap-2 uppercase tracking-[0.2em] mb-12 group">
            Return to Material Streams
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="flex items-center gap-8">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden shadow-inner border border-border-light shrink-0">
                    <img src={categoryStyle.image} alt={category?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-dark-slate tracking-tight leading-tight">{category?.name}</h1>
                    <p className="text-lg text-muted-gray font-medium mt-3">Verified listings waiting for resource recovery.</p>
                </div>
            </div>
            <div className="bg-white border border-border-light px-10 py-6 rounded-[2.5rem] shadow-corporate text-center min-w-[180px]">
              <p className="text-[10px] text-muted-gray font-bold uppercase tracking-[0.2em] mb-2">Active listings</p>
              <p className="text-5xl font-extrabold text-primary tracking-tighter">{requests.filter(r => r.status === 'OPEN').length}</p>
            </div>
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

        {requests.length === 0 ? (
          <div className="bg-white rounded-[3.5rem] border-2 border-dashed border-stone-100 py-32 text-center shadow-sm animate-fade-up">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
               <Package className="h-8 w-8 text-stone-200" />
            </div>
            <h3 className="text-2xl font-extrabold text-dark-slate tracking-tight">Stream Currently Empty</h3>
            <p className="text-muted-gray font-medium mt-2 mb-10 max-w-xs mx-auto leading-relaxed">There are no active recovery requests in this stream at the moment.</p>
            <Link to="/browse-requests" className="btn-primary inline-flex">
                <PlusCircle className="w-5 h-5" /> Post First Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {requests.map((waste) => {
                const style = getCategoryStyles(category?.name);
                return (
                    <div key={waste.id} className="bg-white rounded-[3rem] p-10 border border-border-light shadow-corporate hover:shadow-corporate-lg transition-all duration-500 group flex flex-col h-full hover:border-primary/20 hover:-translate-y-1.5 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-10">
                          <div className="flex flex-col gap-2">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-bold ${style.color} ${style.text} border border-border-light uppercase tracking-wider`}>
                                  <div className="w-4 h-4 rounded-full overflow-hidden border border-white/50 shrink-0">
                                      <img src={style.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  {category?.name}
                              </span>
                              {waste.is_sellable ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-primary text-white uppercase tracking-wider shadow-sm">
                                      <TrendingUp className="w-3 h-3" /> Marketable
                                  </span>
                              ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-stone-100 text-muted-gray border border-border-light uppercase tracking-wider">
                                      Donation
                                  </span>
                              )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              waste.status === 'OPEN' ? 'bg-soft-mint text-primary border-primary/20' : 
                              waste.status === 'BOOKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-dark-slate text-white border-transparent'
                          }`}>
                              {waste.status}
                          </span>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-extrabold text-dark-slate tracking-tight leading-snug mb-4 group-hover:text-primary transition-colors line-clamp-2">
                                {waste.description || 'Standard material stream collection request.'}
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-stone-50/50 p-4 rounded-2xl border border-border-light flex flex-col">
                                    <span className="text-[8px] font-bold text-muted-gray uppercase tracking-widest mb-1">Quantity</span>
                                    <span className="text-sm font-extrabold text-dark-slate flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5 text-primary" /> {waste.quantity} {waste.unit || 'kg'}
                                    </span>
                                </div>
                                <div className="bg-stone-50/50 p-4 rounded-2xl border border-border-light flex flex-col">
                                    <span className="text-[8px] font-bold text-muted-gray uppercase tracking-widest mb-1">Valuation</span>
                                    <span className={`text-sm font-extrabold flex items-center gap-1 ${waste.is_sellable ? 'text-primary' : 'text-stone-400'}`}>
                                        <DollarSign className="w-3.5 h-3.5" /> {waste.is_sellable ? `LKR ${waste.price}` : 'FREE'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-muted-gray text-xs font-bold bg-stone-50/50 p-5 rounded-2xl border border-border-light">
                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-dark-slate leading-relaxed line-clamp-2">{waste.address_line}</span>
                            </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-border-light flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-gray uppercase tracking-widest">
                               <Calendar className="w-3.5 h-3.5" /> {waste.pickup_date}
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                  onClick={() => openDetails(waste)}
                                  className="w-10 h-10 rounded-xl bg-stone-50 border border-border-light flex items-center justify-center text-muted-gray hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                                  title="View Details"
                              >
                                  <Eye className="w-5 h-5" />
                              </button>
                              
                              {waste.status === 'OPEN' && (
                                  <button 
                                      onClick={() => handleBookPickup(waste.id)}
                                      className="px-6 py-2.5 bg-dark-slate text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary transition-all active:scale-95 shadow-sm"
                                  >
                                      {token && currentUser?.role === 'COLLECTOR' ? 'Claim Job' : (token ? 'Manage' : 'Claim')}
                                  </button>
                              )}

                              {currentUser?.id === waste.household_id && waste.status === 'OPEN' && (
                                  <button 
                                      onClick={() => navigate('/browse-requests', { state: { editRequest: waste } })}
                                      className="w-10 h-10 rounded-xl bg-soft-mint border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
                                      title="Edit Request"
                                  >
                                      <Edit2 className="w-4 h-4" />
                                  </button>
                              )}
                            </div>
                        </div>
                    </div>
                );
            })}
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

export default CategoryRequests;

