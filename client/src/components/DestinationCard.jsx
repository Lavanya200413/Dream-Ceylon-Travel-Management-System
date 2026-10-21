import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const DestinationCard = ({ destination }) => {
  return (
    <Link to={`/destinations/${destination._id}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 group cursor-pointer">
        <div className="h-48 bg-gray-200 overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition-all z-10" />
          <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-800 text-lg font-bold">
            {destination.name}
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{destination.name}</h3>
            <span className="flex items-center text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              <Star size={14} className="mr-1 fill-current" /> {destination.rating}
            </span>
          </div>
          <p className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin size={14} className="mr-1" /> {destination.district} • {destination.category}
          </p>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{destination.description}</p>
          <div className="w-full text-center py-2 bg-blue-50 text-blue-700 font-medium rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
