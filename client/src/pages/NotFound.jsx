import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, MapPin, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50 px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100 space-y-6">
        <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Compass size={40} className="animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            404 Error • Page Not Found
          </span>
          <h1 className="text-3xl font-extrabold text-blue-950">
            Lost in Sri Lanka?
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Let us guide you back to scenic horizons.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Home size={15} /> Return Home
          </Link>
          <Link
            to="/destinations"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <MapPin size={15} /> Explore Destinations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

