import { X, Calendar, Clock, MapPin, Package, Tag, DollarSign, User, Truck, CheckCircle2, Info } from 'lucide-react';

const RequestDetailsModal = ({ isOpen, onClose, request, categories }) => {
  if (!isOpen || !request) return null;

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Unknown';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'BOOKED': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'COLLECTED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-600 px-8 py-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                    <Info className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Pickup Details</h2>
            </div>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm inline-block ${getStatusStyle(request.status)}`}>
                        {request.status}
                    </span>
                    <h3 className="text-3xl font-black text-gray-900 leading-tight">
                        {getCategoryName(request.category_id)} Request
                    </h3>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Request ID</p>
                    <p className="text-xl font-black text-gray-900 leading-none">#{request.id.toString().padStart(4, '0')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
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

                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                        <div className={`p-2.5 rounded-xl ${request.is_sellable ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{request.is_sellable ? 'Sellable Price' : 'Price Status'}</p>
                            <p className="text-sm font-black text-gray-900">{request.is_sellable ? `Rs. ${request.price || 0}` : 'Free Pickup'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100 h-full">
                        <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 flex-shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Address</p>
                            <p className="text-sm font-black text-gray-700 leading-tight">{request.address_line}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Additional Description</p>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 min-h-[100px]">
                    <p className="text-gray-600 font-medium leading-relaxed italic">
                        "{request.description || 'No specific details provided.'}"
                    </p>
                </div>
            </div>

            {/* Entity roles involved */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Household ID</p>
                        <p className="text-xs font-black text-gray-900">User #{request.household_id}</p>
                    </div>
                </div>
                {request.collector_id && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Assigned Collector</p>
                            <p className="text-xs font-black text-gray-900">User #{request.collector_id}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Action */}
        <div className="bg-gray-50 px-8 py-6 flex justify-end">
            <button 
                onClick={onClose}
                className="px-8 py-3 bg-gray-900 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
            >
                Close Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
