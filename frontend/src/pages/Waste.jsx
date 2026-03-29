import { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const Waste = () => {
  const [wastes, setWastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWastes();
  }, []);

  const fetchWastes = async () => {
    try {
      const response = await API.get('/wastes');
      setWastes(response.data);
    } catch (err) {
      setError('Failed to fetch waste records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await API.delete(`/wastes/${id}`);
        setWastes(wastes.filter(w => w.id !== id));
      } catch (err) {
        alert('Failed to delete waste record');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Waste Records</h1>
            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {wastes.length === 0 ? (
                  <li className="px-6 py-12 text-center text-gray-500">No waste records found.</li>
                ) : (
                  wastes.map((waste) => (
                    <li key={waste.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{waste.type || 'Waste Record'}</h3>
                        <p className="text-sm text-gray-500">
                          {waste.weight}kg - {new Date(waste.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(waste.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Waste;
