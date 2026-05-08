import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Loader2, X, CheckCircle2, Package, MapPin, PlusCircle, Map } from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const getCategoryStyles = (name) => {
  const styles = {
    'Coconut Shells': { icon: '🥥', color: 'bg-orange-50', text: 'text-orange-700' },
    'Coconut Husks': { icon: '🌴', color: 'bg-emerald-50', text: 'text-emerald-700' },
    'Plastic': { icon: '🥤', color: 'bg-blue-50', text: 'text-blue-700' },
    'Glass': { icon: '🍾', color: 'bg-purple-50', text: 'text-purple-700' },
    'Paper/Cardboard': { icon: '📦', color: 'bg-yellow-50', text: 'text-yellow-700' },
    'Food Waste': { icon: '🍎', color: 'bg-red-50', text: 'text-red-700' },
    'General Disposal': { icon: '🗑️', color: 'bg-slate-50', text: 'text-slate-700' },
  };
  return styles[name] || { icon: '♻️', color: 'bg-slate-50', text: 'text-primary' };
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

  const [formData, setFormData] = useState({ description: '', category_id: '', quantity: '', unit: 'kg', pickup_date: '', startTime: '', endTime: '', address_line: '', latitude: 6.9271, longitude: 79.8612 });

  useEffect(() => {
    const load = async () => {
      try {
        const [w, c] = await Promise.all([API.get('/wastes'), API.get('/categories')]);
        setWastes(w.data); setCategories(c.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
    if (location.state?.editRequest) { setFormData(location.state.editRequest); setIsFormOpen(true); }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.id) await API.put(`/wastes/${formData.id}`, formData);
      else await API.post('/wastes', formData);
      setIsFormOpen(false); navigate('/dashboard');
    } catch (err) { alert('Error processing request'); }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-app font-bold text-primary">Accessing Terminal...</div>;

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
                <div className={`w-20 h-20 ${style.color} rounded-2xl flex items-center justify-center text-4xl mb-5 shadow-3d group-hover:scale-105 transition-transform`}>{style.icon}</div>
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
                <div className="space-y-3">
                  <label className="text-[11px] font-extrabold text-muted-gray uppercase tracking-widest ml-3">Logistics Address</label>
                  <input type="text" className="input-app w-full" placeholder="Specify coordinates..." value={formData.address_line} onChange={e => setFormData({...formData, address_line: e.target.value})} />
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
