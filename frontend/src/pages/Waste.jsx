import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Loader2, X, CheckCircle2, Package, MapPin, PlusCircle, Map } from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import ecoLogo from '../assets/illustrations/eco-logo.png';

// Category Images
import shellImg from '../assets/categories/coconut-shells.jpg';
import huskImg from '../assets/categories/coconut-husks.jpg';
import plasticImg from '../assets/categories/plastic.jpg';
import glassImg from '../assets/categories/glass.jpg';
import paperImg from '../assets/categories/paper.jpg';
import foodImg from '../assets/categories/food.jpg';
import generalImg from '../assets/categories/general.jpg';

const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { image: shellImg, color: 'bg-orange-50', text: 'text-orange-700' },
    'Coconut Husks': { image: huskImg, color: 'bg-emerald-50', text: 'text-emerald-700' },
    'Plastic': { image: plasticImg, color: 'bg-blue-50', text: 'text-blue-700' },
    'Glass': { image: glassImg, color: 'bg-purple-50', text: 'text-purple-700' },
    'Paper/Cardboard': { image: paperImg, color: 'bg-yellow-50', text: 'text-yellow-700' },
    'Food Waste': { image: foodImg, color: 'bg-red-50', text: 'text-red-700' },
    'General Disposal': { image: generalImg, color: 'bg-slate-50', text: 'text-slate-700' },
  };
  return styles[name] || { image: generalImg, color: 'bg-slate-50', text: 'text-primary' };
};

const MapController = ({ setPosition }) => {
    useMapEvents({ moveend(e) { setPosition([e.target.getCenter().lat, e.target.getCenter().lng]); } });
    return null;
};

const Waste = () => {
  const [wastes, setWastes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ 
    description: '', 
    category_id: '', 
    quantity: '', 
    unit: 'kg', 
    pickup_date: '', 
    time_slot: '',
    is_sellable: false,
    price: '',
    address_line: '', 
    latitude: 6.9271, 
    longitude: 79.8612 
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [w, c] = await Promise.all([API.get('/wastes'), API.get('/categories')]);
        setWastes(w.data); setCategories(c.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
    if (location.state?.editRequest) { 
      const req = location.state.editRequest;
      setFormData({
        ...req,
        category_id: req.category_id.toString(),
        quantity: req.quantity.toString(),
        price: req.price?.toString() || ''
      }); 
      setIsFormOpen(true); 
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Validate and format data
    const payload = {
      ...formData,
      category_id: parseInt(formData.category_id),
      quantity: parseFloat(formData.quantity),
      price: formData.is_sellable ? parseFloat(formData.price) : null,
      pickup_date: formData.pickup_date, // Should be YYYY-MM-DD
      time_slot: formData.time_slot
    };

    try {
      if (formData.id) await API.put(`/wastes/${formData.id}`, payload);
      else await API.post('/wastes', payload);
      setIsFormOpen(false); navigate('/dashboard');
    } catch (err) { 
      console.error(err);
      alert('Error processing request: ' + (err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Unknown error')); 
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-app gap-8">
      <img src={ecoLogo} alt="Logo" className="h-24 w-auto opacity-30 animate-pulse" />
      <div className="font-sans italic text-2xl font-black text-primary opacity-40 tracking-[0.2em] uppercase">EcoConnect</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-app font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto py-40 px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16 animate-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark-slate tracking-tight mb-4 uppercase">Marketplace</h1>
            <p className="text-muted-gray font-medium text-lg max-w-xl">Active material streams for industrial recovery.</p>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="btn-tactile px-12">
            {isFormOpen ? <X /> : <PlusCircle />} {isFormOpen ? "Close Console" : "New Listing"}
          </button>
        </div>

        {/* 3D Tile Category Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-24 animate-in">
          {categories.map((cat) => {
            const style = getCategoryStyles(cat.name);
            return (
              <Link key={cat.id} to={`/browse-requests/${cat.id}`} className="p-8 rounded-2xl bg-white border border-border-light shadow-3d group hover:-translate-y-1 hover:shadow-3d-elevated transition-all flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 shadow-3d group-hover:scale-105 transition-transform shrink-0">
                    <img src={style.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-[11px] font-extrabold text-dark-slate uppercase tracking-widest">{cat.name}</h3>
                <span className="text-[9px] font-bold text-primary mt-2 uppercase">{wastes.filter(w => w.category_id === cat.id && w.status === 'OPEN').length} Active</span>
              </Link>
            );
          })}
        </div>

        {/* Tactile Panel Form */}
        {isFormOpen && (
          <div className="bg-white rounded-[2.5rem] border border-border-light shadow-3d-elevated p-10 md:p-16 mb-20 animate-in">
            <h2 className="text-2xl font-extrabold text-dark-slate mb-12 flex items-center gap-4 uppercase tracking-tight">
               <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-3d"><Package className="w-6 h-6" /></div>
               Stream Configuration
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Resource Category</label>
                  <select className="input-app w-full appearance-none cursor-pointer" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Stream</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Quantity</label>
                    <input type="number" className="input-app w-full" placeholder="0.00" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Unit</label>
                    <select className="input-app w-full" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                      <option value="kg">KG</option>
                      <option value="pieces">PCS</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Pickup Date</label>
                    <input type="date" className="input-app w-full" value={formData.pickup_date} onChange={e => setFormData({...formData, pickup_date: e.target.value})} required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Time Slot</label>
                    <select className="input-app w-full" value={formData.time_slot} onChange={e => setFormData({...formData, time_slot: e.target.value})} required>
                      <option value="">Select Slot</option>
                      <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
                      <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                      <option value="Evening (4PM - 8PM)">Evening (4PM - 8PM)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-dark-slate uppercase tracking-widest">Marketable Listing</label>
                    <input type="checkbox" className="w-5 h-5 accent-primary" checked={formData.is_sellable} onChange={e => setFormData({...formData, is_sellable: e.target.checked})} />
                  </div>
                  {formData.is_sellable && (
                    <div className="space-y-3 animate-in">
                      <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Valuation (LKR)</label>
                      <input type="number" className="input-app w-full" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required={formData.is_sellable} />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Logistics Address</label>
                  <input type="text" className="input-app w-full" placeholder="Specify coordinates..." value={formData.address_line} onChange={e => setFormData({...formData, address_line: e.target.value})} required />
                </div>
                <button type="submit" disabled={submitting} className="btn-tactile w-full text-lg uppercase tracking-widest mt-6">
                  {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} {formData.id ? "Update Request" : "Confirm Stream"}
                </button>
              </div>

              <div className="h-[500px] rounded-3xl overflow-hidden border-[12px] border-slate-50 shadow-3d relative">
                <MapContainer center={[6.9271, 79.8612]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController setPosition={pos => setFormData({...formData, latitude: pos[0], longitude: pos[1]})} />
                </MapContainer>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <MapPin className="text-primary w-12 h-12 -mt-12 absolute drop-shadow-2xl" />
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Waste;
