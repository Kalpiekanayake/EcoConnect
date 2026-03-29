import { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back{user ? `, ${user.username}` : ''}!
              </h1>
              <p className="text-gray-600">
                This is your waste management dashboard. From here you can track and manage your waste records.
              </p>
              
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                  <h3 className="text-lg font-medium text-green-800">Quick Actions</h3>
                  <div className="mt-2">
                    <a href="/waste" className="text-sm font-medium text-green-600 hover:text-green-500">
                      View all waste records &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
