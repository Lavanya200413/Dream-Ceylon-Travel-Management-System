import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Map, CreditCard, Star } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const roleLabels = {
    tourist: 'Tourist',
    guide: 'Tour Guide',
    hotel_owner: 'Hotel Partner',
    admin: 'Administrator'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-blue-900 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-blue-200">Manage your profile and bookings</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30 font-semibold tracking-wide">
            Role: {roleLabels[user.role] || user.role}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center"><User size={18} className="mr-2 text-blue-600"/> Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Edit Profile</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Change Password</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Preferences</a></li>
            </ul>
          </div>
        </div>
        
        <div className="col-span-3">
          {user.role === 'tourist' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Bookings & Plans</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-md">
                  <Map className="mb-4 opacity-80" size={32} />
                  <h4 className="text-lg font-bold">Active Plans</h4>
                  <p className="text-3xl font-extrabold mt-1">0</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-md">
                  <CreditCard className="mb-4 opacity-80" size={32} />
                  <h4 className="text-lg font-bold">Confirmed Bookings</h4>
                  <p className="text-3xl font-extrabold mt-1">0</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 rounded-xl text-white shadow-md">
                  <Star className="mb-4 opacity-80" size={32} />
                  <h4 className="text-lg font-bold">Reviews Given</h4>
                  <p className="text-3xl font-extrabold mt-1">0</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center mt-8">
                <div className="text-gray-400 mb-4 flex justify-center"><Map size={48} /></div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No active plans yet</h3>
                <p className="text-gray-500 mb-6">Head over to the Smart Planner to start your journey.</p>
                <a href="/planner" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Create a Plan
                </a>
              </div>
            </div>
          )}
          
          {(user.role === 'hotel_owner' || user.role === 'guide') && (
            <div className="space-y-6">
               <h2 className="text-2xl font-bold text-gray-800">Service Management</h2>
               <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
                 Please complete your provider profile to receive bookings.
               </div>
            </div>
          )}
          
          {user.role === 'admin' && (
            <div className="space-y-6">
               <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
               <p>System metrics will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
