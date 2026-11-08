import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PackageCard from '../components/PackageCard';
import { PackageContext } from '../context/PackageContext';
import { Car, Home, Sparkles, Check, X, Globe } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency, setCurrency, currencyRates, formatPrice } = useContext(PackageContext);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/packages');
      const data = res.data?.data || res.data || [];
      // Ensure consistent order: Basic -> Standard -> Premium
      const order = { Basic: 1, Standard: 2, Premium: 3 };
      data.sort((a, b) => (order[a.packageName] || 9) - (order[b.packageName] || 9));
      setPackages(data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load tour packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Title & Introduction */}
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          Tailored Sri Lankan Journeys • Module 3 & 8
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-950 mt-3 mb-4 tracking-tight">
          Dream Ceylon Tour Packages
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Choose the exact level of travel assistance that fits your style. From dedicated standard transport to complete all-inclusive luxury.
        </p>

        {/* Multi-Currency Selector Bar */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mr-1">
            <Globe size={14} className="text-blue-600" /> Display Currency:
          </span>
          {Object.keys(currencyRates).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setCurrency(code)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currency === code
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {code} ({currencyRates[code].symbol.trim()})
            </button>
          ))}
        </div>
      </div>

      {/* Quick Tier Comparison Summary Pill Bar */}
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3">
          <Car className="text-amber-700 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-amber-950">1. Basic Tier</h4>
            <p className="text-xs text-amber-800/80">
              Standard transport only. Perfect when you only need a dedicated vehicle & driver.
            </p>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-xl flex items-start gap-3">
          <Home className="text-blue-700 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-blue-950">2. Standard Tier</h4>
            <p className="text-xs text-blue-800/80">
              Hotel stays & transport included. Meals excluded by default; guide available as add-on.
            </p>
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-200/80 p-4 rounded-xl flex items-start gap-3">
          <Sparkles className="text-purple-700 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-sm text-purple-950">3. Premium Tier</h4>
            <p className="text-xs text-purple-800/80">
              All-inclusive complete experience. 5-star stays, customized meals, and specialist guide.
            </p>
          </div>
        </div>
      </div>

      {/* Packages Grid / States */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="text-sm text-gray-500 font-medium">Loading tour packages...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 px-6 bg-red-50 rounded-2xl border border-red-200 max-w-xl mx-auto mb-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 font-bold text-xl">
            !
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Unable to Load Packages</h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <button
            onClick={fetchPackages}
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-6 py-2.5 rounded-lg shadow transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-xl mx-auto">
          <p className="text-gray-700 text-lg font-semibold mb-2">No packages found in database.</p>
          <p className="text-gray-500 text-sm mb-6">
            The packages collection is currently empty. Run the safe recovery script to restore package tiers.
          </p>
          <button
            onClick={fetchPackages}
            className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-200">
              <h2 className="text-2xl font-extrabold text-blue-950">
                Side-by-Side Tier Comparison
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Compare included services, accommodation standards, and customization options across all three tiers.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-white text-xs uppercase tracking-wider text-gray-500">
                    <th className="py-4 px-6 font-bold">Service / Feature</th>
                    <th className="py-4 px-6 font-bold text-amber-800">Basic Package</th>
                    <th className="py-4 px-6 font-bold text-blue-800">Standard Package</th>
                    <th className="py-4 px-6 font-bold text-purple-800">Premium Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  <tr>
                    <td className="py-4 px-6 font-bold text-gray-900">Daily Rate (Per Person)</td>
                    {packages.map((p) => (
                      <td key={p._id} className="py-4 px-6 font-extrabold text-blue-950">
                        {formatPrice(p.baseCharge)} / day
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-gray-800">Private Transport & Fuel</td>
                    <td className="py-4 px-6 text-green-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Check size={16} /> Included (A/C Vehicle)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-green-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Check size={16} /> Included (Comfort Sedan/SUV)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-green-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Check size={16} /> Luxury SUV / Executive Van
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-gray-800">Hotel Accommodation</td>
                    <td className="py-4 px-6 text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <X size={16} /> Excluded (Self-booked)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-green-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Check size={16} /> 3-Star to 4-Star Partner Stays
                      </span>
                    </td>
                    <td className="py-4 px-6 text-green-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Check size={16} /> 5-Star Luxury Resorts & Villas
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-gray-800">Meals & Dining Plan</td>
                    <td className="py-4 px-6 text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <X size={16} /> Excluded
                      </span>
                    </td>
                    <td className="py-4 px-6 text-amber-700">Breakfast Only</td>
                    <td className="py-4 px-6 text-green-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Check size={16} /> Full-Board Customizable Dining
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-gray-800">Licensed Tour Guide</td>
                    <td className="py-4 px-6 text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <X size={16} /> Driver-only
                      </span>
                    </td>
                    <td className="py-4 px-6 text-blue-700 font-medium">
                      Optional Add-on (+{formatPrice(45)}/day)
                    </td>
                    <td className="py-4 px-6 text-green-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Check size={16} /> Dedicated National Specialist Guide
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Need a fully customized itinerary?</h3>
          <p className="text-blue-200 text-sm">
            Use our AI-powered Smart Planner to combine your package with interactive route mapping and holiday scheduling.
          </p>
        </div>
        <Link
          to="/planner"
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap text-sm"
        >
          Open Smart Planner &rarr;
        </Link>
      </div>
    </div>
  );
};

export default Packages;
