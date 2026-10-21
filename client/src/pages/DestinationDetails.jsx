import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Star, Calendar, ArrowLeft, Navigation, Plus } from 'lucide-react';
import MapView from '../components/MapView';

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/destinations/${id}`);
        setDestination(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch destination details');
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;
  }

  if (error || !destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Destination not found'}</h2>
        <button onClick={() => navigate('/destinations')} className="text-blue-600 hover:underline">
          &larr; Back to Destinations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/destinations')} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Destinations
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Image Area (placeholder) */}
        <div className="h-64 bg-gradient-to-r from-blue-900 to-blue-700 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white z-10 text-center px-4 drop-shadow-md">
            {destination.name}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8 p-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="flex items-center text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                <Star size={16} className="mr-1.5 fill-current" /> {destination.rating} / 5
              </span>
              <span className="flex items-center text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <MapPin size={16} className="mr-1.5" /> {destination.district}
              </span>
              <span className="flex items-center text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                {destination.category}
              </span>
              <span className="flex items-center text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                <Calendar size={16} className="mr-1.5" /> Best Time: {destination.bestVisitTime}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">About {destination.name}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {destination.description}
              </p>
            </div>

            <div className="pt-6 flex gap-4">
              <button 
                onClick={() => document.getElementById('map-view').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow transition-colors"
              >
                <Navigation size={20} className="mr-2" /> View on Map
              </button>
              <button 
                onClick={() => navigate('/planner')}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg shadow transition-colors"
              >
                <Plus size={20} className="mr-2" /> Create Trip Plan
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-fit">
            <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Quick Info</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex justify-between">
                <span className="font-semibold text-gray-700">Latitude</span>
                <span>{destination.latitude}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-semibold text-gray-700">Longitude</span>
                <span>{destination.longitude}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-semibold text-gray-700">Views</span>
                <span>{destination.viewCount}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-semibold text-gray-700">Category</span>
                <span>{destination.category}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Map Section */}
        <div id="map-view" className="border-t border-gray-100 p-8 bg-gray-50">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Location</h3>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <MapView 
              destinations={[{
                name: destination.name,
                district: destination.district,
                category: destination.category,
                rating: destination.rating,
                latitude: destination.latitude,
                longitude: destination.longitude
              }]} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
