import { X, Calendar, Clock, MapPin, Package, Tag, DollarSign, User, Truck, CheckCircle2, Info } from 'lucide-react';

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

const RequestDetailsModal = ({ isOpen, onClose, request, categories }) => {
  if (!isOpen || !request) return null;

  const category = categories.find(c => c.id === request.category_id);
  const style = getCategoryStyles(category?.name);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-white text-emerald-600 border-emerald-50';
      case 'BOOKED': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'COLLECTED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-start">
            <div className="flex items-center gap-6">
                <div className={`w-16 h-16 ${style.color} rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white`}>
                    {style.icon}
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">{category?.name || 'Waste Request'}</h2>
                    <div className={`mt-2 inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                        {request.status}
                    </div>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column: Core Info */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                        <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Quantity</p>
                            <p className="text-sm font-black text-gray-900">{request.quantity} {request.unit || 'Units'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pickup Date</p>
                            <p className="text-sm font-black text-gray-900">{request.pickup_date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                        <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Time Slot</p>
                            <p className="text-sm font-black text-gray-900">{request.time_slot}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Logistics */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                        <div className={`p-2.5 rounded-xl ${request.is_sellable ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{request.is_sellable ? 'Sellable Price' : 'Price Status'}</p>
                            <p className="text-sm font-black text-gray-900">{request.is_sellable ? `Rs. ${request.price || 0}` : 'Free Pickup'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                        <div className="bg-red-100 p-2.5 rounded-xl text-red-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pickup Address</p>
                            <p className="text-sm font-bold text-gray-900 mt-1 leading-relaxed">{request.address_line}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom: Description */}
                <div className="md:col-span-2">
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <Info className="w-4 h-4 text-gray-400" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Additional Details</p>
                        </div>
                        <p className="text-gray-600 text-sm font-medium italic leading-relaxed">
                            "{request.description || 'No additional instructions provided by the household.'}"
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex justify-end">
            <button 
                onClick={onClose}
                className="px-10 py-4 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
            >
                Close Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
