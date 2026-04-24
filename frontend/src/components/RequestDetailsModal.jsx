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
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-10 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
            <div className="flex items-center gap-8">
                <div className={`w-24 h-24 ${style.color} rounded-3xl flex items-center justify-center text-5xl shadow-sm border border-white/50`}>
                    {style.icon}
                </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{category?.name || 'Waste Request'}</h2>
                    <div className={`mt-3 inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(request.status)}`}>
                        {request.status}
                    </div>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-red-600 hover:shadow-sm transition-all border border-transparent hover:border-red-100"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="p-10 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Core Info */}
                <div className="space-y-6">
                    <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                        <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 border border-emerald-100">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Total Quantity</p>
                            <p className="text-sm font-bold text-gray-900">{request.quantity} {request.unit || 'Units'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 border border-blue-100">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Pickup Date</p>
                            <p className="text-sm font-bold text-gray-900">{request.pickup_date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                        <div className="bg-amber-50 p-3 rounded-xl text-amber-600 border border-amber-100">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Time Slot</p>
                            <p className="text-sm font-bold text-gray-900">{request.time_slot}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Logistics */}
                <div className="space-y-6">
                    <div className="flex items-center gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                        <div className={`p-3 rounded-xl border ${request.is_sellable ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white text-gray-400 border-gray-100'}`}>
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{request.is_sellable ? 'Sellable Price' : 'Price Status'}</p>
                            <p className={`text-sm font-bold ${request.is_sellable ? 'text-emerald-600' : 'text-gray-900'}`}>{request.is_sellable ? `Rs. ${request.price || 0}` : 'Free Collection'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                        <div className="bg-red-50 p-3 rounded-xl text-red-600 border border-red-100 flex-shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Pickup Address</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1 leading-relaxed">{request.address_line}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom: Description */}
                <div className="md:col-span-2 pt-4">
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100/50 shadow-inner">
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="w-4 h-4 text-emerald-500" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Additional Details</p>
                        </div>
                        <p className="text-gray-600 text-sm font-semibold italic leading-relaxed">
                            "{request.description || 'No additional instructions provided by the household.'}"
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex justify-end">
            <button 
                onClick={onClose}
                className="px-12 py-4 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-gray-200 active:scale-95"
            >
                Close Request Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
