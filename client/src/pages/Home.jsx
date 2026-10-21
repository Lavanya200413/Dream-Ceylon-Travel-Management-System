import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Calendar, Map as MapIcon } from 'lucide-react';

const Home = () => {
  return (
    <div>
      <section className="relative bg-blue-900 text-white overflow-hidden py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-green-900 opacity-90 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Plan Your Smart Sri Lankan Journey</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Discover the pearl of the Indian Ocean with personalized itineraries, top-rated guides, and seamless bookings.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/planner" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105">
              Start Planning
            </Link>
            <Link to="/destinations" className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition">
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Itineraries</h3>
              <p className="text-gray-600">AI-driven recommendations tailored to your budget, interests, and weather preferences.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Bookings</h3>
              <p className="text-gray-600">Book hotels, transport, and certified local guides all in one unified platform.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapIcon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Curated Packages</h3>
              <p className="text-gray-600">Choose from carefully crafted tour packages spanning from budget to luxury experiences.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
