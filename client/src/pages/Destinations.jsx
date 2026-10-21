import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await api.get('/destinations');
        setDestinations(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Discover Sri Lanka</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore ancient ruins, pristine beaches, and breathtaking mountains.</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : destinations && destinations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map(dest => (
            <DestinationCard key={dest._id} destination={dest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No destinations found.</p>
        </div>
      )}
    </div>
  );
};

export default Destinations;
