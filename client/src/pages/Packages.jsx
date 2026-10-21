import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PackageCard from '../components/PackageCard';
import { Car, Home, Sparkles, CheckCircle2 } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/packages');
        const data = res.data?.data || res.data || [];
        // Ensure consistent order: Basic -> Standard -> Premium
        const order = { Basic: 1, Standard: 2, Premium: 3 };
        data.sort((a, b) => (order[a.packageName] || 9) - (order[b.packageName] || 9));
        setPackages(data);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Title & Introduction */}
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          Tailored Sri Lankan Journeys
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950 mt-3 mb-4 tracking-tight">
          Dream Ceylon Tour Packages
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Choose the exact level of travel assistance that fits your style. From dedicated standard transport to complete all-inclusive luxury.
        </p>
      </div>

      {/* Quick Tier Comparison Summary Pill Bar */}
      <div className="grid md:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto">
        <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3">
          <Car className="text-amber-700 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-amber-950">1. Basic Tier</h4>
            <p className="text-xs text-amber-800/80">Standard transport only. Perfect when you only need a dedicated vehicle & driver.</p>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-xl flex items-start gap-3">
          <Home className="text-blue-700 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-blue-950">2. Standard Tier</h4>
            <p className="text-xs text-blue-800/80">Hotel stays & transport included. Meals excluded by default; guide available as add-on.</p>
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-200/80 p-4 rounded-xl flex items-start gap-3">
          <Sparkles className="text-purple-700 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-purple-950">3. Premium Tier</h4>
            <p className="text-xs text-purple-800/80">All-inclusive complete experience. 5-star stays, customized meals, and specialist guide.</p>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No packages available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {packages.map(pkg => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="mt-16 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Need a fully customized itinerary?</h3>
          <p className="text-blue-200 text-sm">Use our AI-powered Smart Planner to combine your package with interactive route mapping.</p>
        </div>
        <a 
          href="/planner" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap text-sm"
        >
          Open Smart Planner &rarr;
        </a>
      </div>

    </div>
  );
};

export default Packages;
