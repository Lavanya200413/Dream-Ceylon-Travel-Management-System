import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PackageContext } from '../context/PackageContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';
import MapView from '../components/MapView';
import { 
  Car, Home, Utensils, Compass, Check, X, Sparkles, 
  ShieldCheck, AlertCircle, Info, ChevronRight, DollarSign 
} from 'lucide-react';

const Planner = () => {
  const { user } = useContext(AuthContext);
  const { 
    selectedPackage, 
    selectPackage, 
    customizations, 
    updateCustomizations, 
    calculatePackageCost 
  } = useContext(PackageContext);

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);

  // Map integration states
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalDistance, setTotalDistance] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  
  const [formData, setFormData] = useState({
    days: 3,
    travelers: 2,
    interests: [],
    weatherPreference: 'Any',
    vehicleType: 'Car',
    budget: 800
  });

  // Fetch all packages if user hasn't selected one or wants to switch
  useEffect(() => {
    const fetchAllPackages = async () => {
      try {
        const res = await api.get('/packages');
        const list = res.data?.data || res.data || [];
        const order = { Basic: 1, Standard: 2, Premium: 3 };
        list.sort((a, b) => (order[a.packageName] || 9) - (order[b.packageName] || 9));
        setAvailablePackages(list);

        // If no package currently selected, default to Standard
        if (!selectedPackage && list.length > 0) {
          const defaultPkg = list.find(p => p.packageName === 'Standard') || list[0];
          selectPackage(defaultPkg);
        }
      } catch (err) {
        console.error('Failed to load packages in planner:', err);
      }
    };
    fetchAllPackages();
  }, []);

  const activePackage = selectedPackage || availablePackages.find(p => p.packageName === 'Standard') || null;

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const fetchRoute = async (dests) => {
    if (dests.length > 1) {
      setLoadingRoute(true);
      let aggregatedCoordinates = [];
      let totalDist = 0;
      let totalDur = 0;

      try {
        for (let i = 0; i < dests.length - 1; i++) {
          const origin = dests[i];
          const dest = dests[i + 1];
          
          const res = await api.get('/maps/route', {
            params: {
              originLat: origin.latitude,
              originLng: origin.longitude,
              destLat: dest.latitude,
              destLng: dest.longitude,
              vehicleType: formData.vehicleType.toLowerCase()
            }
          });

          if (res.data.success) {
            const routeData = res.data.data;
            totalDist += routeData.distance;
            totalDur += routeData.duration;
            
            // OSRM returns [lng, lat], Leaflet needs [lat, lng]
            const leafletCoords = routeData.coordinates.map(coord => [coord[1], coord[0]]);
            aggregatedCoordinates = [...aggregatedCoordinates, ...leafletCoords];
          }
        }
        
        setRouteCoordinates(aggregatedCoordinates);
        setTotalDistance((totalDist / 1000).toFixed(2) + ' km');
        
        const hours = Math.floor(totalDur / 3600);
        const minutes = Math.floor((totalDur % 3600) / 60);
        setTotalDuration(`${hours}h ${minutes}m`);
        
      } catch (err) {
        console.error("Route fetching error:", err);
      } finally {
        setLoadingRoute(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please login to generate your smart plan.");
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/destinations');
      let dests = res.data?.data || res.data || [];
      
      if (formData.interests.length > 0) {
        dests = dests.filter(d => formData.interests.includes(d.category));
      }
      
      if (formData.weatherPreference === 'Cold') {
        dests = dests.filter(d => ['Nuwara Eliya', 'Badulla'].includes(d.district));
      } else if (formData.weatherPreference === 'Hot') {
        dests = dests.filter(d => !['Nuwara Eliya', 'Badulla'].includes(d.district));
      }
      
      const finalDests = dests.filter(d => d.latitude && d.longitude).slice(0, formData.days);
      
      // Calculate dynamic cost based on package rules and selections
      const costCalculation = calculatePackageCost(activePackage, formData.days, formData.travelers, customizations);

      setResults({
        destinations: finalDests,
        costBreakdown: costCalculation,
        estimatedCost: costCalculation.grandTotal,
        packageSnapshot: activePackage,
        customizationsSnapshot: { ...customizations },
        itinerary: finalDests.map((d, i) => ({ day: i + 1, ...d }))
      });
      
      await fetchRoute(finalDests);
      setLoading(false);
      
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Current live cost calculation preview
  const currentCost = calculatePackageCost(activePackage, formData.days, formData.travelers, customizations);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 p-8 text-white text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-300 bg-blue-800/60 px-3.5 py-1 rounded-full border border-blue-400/30">
            Intelligent Tour Planner
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-2 mb-2">Smart Ceylon Journey Planner</h1>
          <p className="text-blue-100 text-sm max-w-xl mx-auto">
            Design your ideal holiday combining custom packages, interactive route mapping, and tailored travel services.
          </p>
        </div>
        
        <div className="p-6 md:p-10">
          {!results ? (
            <div className="space-y-8">
              
              {/* Stepper Wizard Indicator */}
              <div className="flex justify-between items-center relative max-w-2xl mx-auto mb-10">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 z-0 transition-all duration-300" 
                  style={{ width: `${(step - 1) * 33.33}%` }}
                ></div>
                
                {[
                  { num: 1, label: 'Package & Basics' },
                  { num: 2, label: 'Interests & Dining' },
                  { num: 3, label: 'Transport & Guide' },
                  { num: 4, label: 'Investment & Review' }
                ].map(s => (
                  <div key={s.num} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s.num ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'}`}>
                      {s.num}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 mt-1 hidden sm:block">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1: PACKAGE SELECTOR & TRIP BASICS */}
              {step === 1 && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Package Selector Cards */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">1. Select Your Tour Package</h2>
                        <p className="text-sm text-gray-500">Each package tier defines your travel facilities and inclusion rules.</p>
                      </div>
                      {activePackage && (
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                          Active: {activePackage.packageName}
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {availablePackages.map(pkg => {
                        const isSelected = activePackage && activePackage.packageName === pkg.packageName;
                        return (
                          <div 
                            key={pkg._id}
                            onClick={() => selectPackage(pkg)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                                {pkg.badge || pkg.packageName}
                              </span>
                              {isSelected && <Check size={18} className="text-blue-600" />}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900">{pkg.packageName} Package</h3>
                            <div className="text-2xl font-extrabold text-gray-900 my-1">
                              ${pkg.baseCharge} <span className="text-xs font-normal text-gray-500">/ person/day</span>
                            </div>

                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>

                            {/* Package Rule Tags */}
                            <div className="space-y-1 text-xs pt-2 border-t border-gray-100">
                              <div className="flex items-center text-gray-700">
                                <Car size={13} className="text-blue-600 mr-1.5 flex-shrink-0" />
                                <span>Transport: Standard Dedicated</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Home size={13} className={pkg.packageName === 'Basic' ? 'text-gray-400 mr-1.5 flex-shrink-0' : 'text-blue-600 mr-1.5 flex-shrink-0'} />
                                <span className={pkg.packageName === 'Basic' ? 'text-gray-400' : 'font-medium'}>
                                  Stays: {pkg.packageName === 'Basic' ? 'Excluded' : 'Included'}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Utensils size={13} className={pkg.packageName === 'Premium' ? 'text-green-600 mr-1.5 flex-shrink-0' : 'text-gray-400 mr-1.5 flex-shrink-0'} />
                                <span className={pkg.packageName === 'Premium' ? 'text-green-700 font-bold' : 'text-gray-400'}>
                                  Meals: {pkg.packageName === 'Premium' ? 'Included (Choice)' : 'Excluded by default'}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Compass size={13} className={pkg.packageName === 'Premium' ? 'text-purple-600 mr-1.5 flex-shrink-0' : pkg.packageName === 'Standard' ? 'text-blue-600 mr-1.5 flex-shrink-0' : 'text-gray-400 mr-1.5 flex-shrink-0'} />
                                <span>
                                  Guide: {pkg.packageName === 'Premium' ? 'Included (Specialist)' : pkg.packageName === 'Standard' ? 'Optional Add-on' : 'Excluded'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trip Basics Inputs */}
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Duration & Party Size</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Days)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="30" 
                          className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-900" 
                          value={formData.days} 
                          onChange={e => setFormData({ ...formData, days: Math.max(1, parseInt(e.target.value) || 1) })} 
                        />
                        <span className="text-xs text-gray-500 mt-1 block">Number of days to tour Sri Lanka</span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Travelers</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="20" 
                          className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-900" 
                          value={formData.travelers} 
                          onChange={e => setFormData({ ...formData, travelers: Math.max(1, parseInt(e.target.value) || 1) })} 
                        />
                        <span className="text-xs text-gray-500 mt-1 block">Adults and accompanied guests</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 2: INTERESTS & DINING RULES */}
              {step === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">2. Destinations of Interest</h2>
                    <p className="text-sm text-gray-500">Pick the travel categories that appeal to you:</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                      {['Cultural', 'Mountain', 'Beach', 'Wildlife', 'Forest'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleInterest(cat)}
                          className={`p-3.5 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${formData.interests.includes(cat) ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                        >
                          <span>{cat}</span>
                          {formData.interests.includes(cat) && <Check size={14} className="text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FOOD & DINING SECTION - RULE SPECIFIC */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Utensils size={20} className="text-blue-600" /> 
                      Food and Meal Services
                    </h3>

                    {/* BASIC PACKAGE FOOD RULE */}
                    {activePackage?.packageName === 'Basic' && (
                      <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-bold text-amber-900 text-sm">Meals are NOT included in the Basic Package</h4>
                          <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                            The Basic Package focuses strictly on standard transport. Tourists arrange all meals, lunches, and beverages independently.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* STANDARD PACKAGE FOOD RULE */}
                    {activePackage?.packageName === 'Standard' && (
                      <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-2xl flex items-start gap-3">
                        <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-bold text-blue-900 text-sm">Food & Meals are Excluded by Default</h4>
                          <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                            The Standard Package covers hotel accommodation and standard transport. Meals are excluded by default, giving you total freedom to taste street foods and local cafes at your leisure.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PREMIUM PACKAGE FOOD SELECTION */}
                    {activePackage?.packageName === 'Premium' && (
                      <div className="space-y-4">
                        <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={18} />
                            <span className="text-xs font-bold text-purple-900">
                              Premium Rule: Choose your preferred food or meal option
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-purple-700">Full-Board Dining Included</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          {activePackage.mealOptions?.map((meal, idx) => {
                            const isSelected = customizations.selectedMealOption === meal.name;
                            return (
                              <div
                                key={idx}
                                onClick={() => updateCustomizations({ selectedMealOption: meal.name })}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-600 bg-white shadow-md' : 'border-gray-200 bg-gray-50/50 hover:border-purple-300'}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <label className="font-bold text-sm text-gray-900 cursor-pointer flex items-center gap-2">
                                    <input 
                                      type="radio" 
                                      name="plannerMealOption" 
                                      checked={isSelected}
                                      onChange={() => updateCustomizations({ selectedMealOption: meal.name })}
                                      className="text-purple-600 focus:ring-purple-500" 
                                    />
                                    {meal.name}
                                  </label>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meal.extraCostPerDay > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {meal.extraCostPerDay > 0 ? `+$${meal.extraCostPerDay}/day` : 'Included'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 ml-5">{meal.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* STEP 3: TRANSPORT & TOUR GUIDE SELECTION */}
              {step === 3 && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Transport Preferences */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">3. Transport & Guide Arrangements</h2>
                    <p className="text-sm text-gray-500">Configure your vehicle type and tour guide according to package rules:</p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                        <select 
                          className="w-full p-3.5 border border-gray-300 rounded-xl font-medium" 
                          value={formData.vehicleType} 
                          onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                        >
                          <option value="Car">Sedan Car (1-3 passengers)</option>
                          <option value="Van">Passenger Van (4-8 passengers)</option>
                          <option value="Bus">Mini-Coach (9+ passengers)</option>
                        </select>
                        <span className="text-xs text-gray-500 mt-1 block">Private air-conditioned vehicle with licensed driver included in all tiers.</span>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Weather Preference</label>
                        <select 
                          className="w-full p-3.5 border border-gray-300 rounded-xl font-medium" 
                          value={formData.weatherPreference} 
                          onChange={e => setFormData({ ...formData, weatherPreference: e.target.value })}
                        >
                          <option value="Any">Any Weather</option>
                          <option value="Hot">Tropical / Warm Beaches & Heritage</option>
                          <option value="Cold">Cool Mountain Highlands (Nuwara Eliya / Ella)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* TOUR GUIDE RULES PER PACKAGE */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Compass size={20} className="text-blue-600" /> 
                      Tour Guide Arrangements
                    </h3>

                    {/* BASIC PACKAGE GUIDE RULE */}
                    {activePackage?.packageName === 'Basic' && (
                      <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-bold text-amber-900 text-sm">Tour Guide NOT Included in Basic Package</h4>
                          <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                            The Basic Package provides standard transport only. Your chauffeur-driver safely navigates the route, but professional guided commentary is not included.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* STANDARD PACKAGE GUIDE RULE (OPTIONAL ADD-ON) */}
                    {activePackage?.packageName === 'Standard' && (
                      <div className="bg-blue-50/80 border border-blue-200 p-6 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-200/70 px-2.5 py-0.5 rounded-full">
                              Standard Package Rule
                            </span>
                            <h4 className="text-lg font-bold text-blue-950 mt-1">Tour Guide is NOT automatically included</h4>
                            <p className="text-xs text-blue-800/80 mt-1 max-w-xl">
                              A tour guide is not included by default in the Standard Package, but can be added as an optional service.
                            </p>
                          </div>

                          <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-3 rounded-xl border border-blue-300 shadow-sm hover:border-blue-500 transition-colors">
                            <input 
                              type="checkbox"
                              checked={customizations.addGuide}
                              onChange={(e) => updateCustomizations({ addGuide: e.target.checked })}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <div>
                              <span className="block font-bold text-sm text-gray-900">Add Tour Guide</span>
                              <span className="text-xs text-blue-700 font-semibold">+${activePackage.guideAddonPrice || 45} / day</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* PREMIUM PACKAGE GUIDE SELECTION (INCLUDED SPECIALIST) */}
                    {activePackage?.packageName === 'Premium' && (
                      <div className="space-y-4">
                        <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={18} />
                            <span className="text-xs font-bold text-purple-900">
                              Premium Rule: Select your preferred specialist tour guide
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-purple-700">Dedicated Guide Included</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          {activePackage.guideOptions?.map((guide, idx) => {
                            const isSelected = customizations.selectedGuideOption === guide.name;
                            return (
                              <div
                                key={idx}
                                onClick={() => updateCustomizations({ selectedGuideOption: guide.name })}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-600 bg-white shadow-md' : 'border-gray-200 bg-gray-50/50 hover:border-purple-300'}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <label className="font-bold text-sm text-gray-900 cursor-pointer flex items-center gap-2">
                                    <input 
                                      type="radio" 
                                      name="plannerGuideOption" 
                                      checked={isSelected}
                                      onChange={() => updateCustomizations({ selectedGuideOption: guide.name })}
                                      className="text-purple-600 focus:ring-purple-500" 
                                    />
                                    {guide.name}
                                  </label>
                                  <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    Included
                                  </span>
                                </div>
                                <p className="text-xs text-purple-900/80 font-medium ml-5 mb-1">{guide.specialty}</p>
                                <p className="text-xs text-gray-500 ml-5">Languages: {guide.languages?.join(', ')}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & LIVE ESTIMATED COST BREAKDOWN */}
              {step === 4 && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">4. Review & Investment Breakdown</h2>
                    <p className="text-sm text-gray-500">
                      Verify your tour configuration and package selections before generating your personalized route.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                          {activePackage?.packageName} Package Tier
                        </span>
                        <h3 className="text-xl font-extrabold text-gray-900 mt-1">{activePackage?.packageName} Experience</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Duration & Party</span>
                        <span className="text-sm font-bold text-gray-900">{formData.days} Days • {formData.travelers} Travelers</span>
                      </div>
                    </div>

                    {/* Inclusions and Options Status */}
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-2.5">
                        <Car size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="block text-gray-900">Transport:</strong>
                          <span className="text-gray-600 text-xs">Standard Private {formData.vehicleType} with chauffeur</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Home size={18} className={activePackage?.packageName === 'Basic' ? 'text-gray-400 mt-0.5 flex-shrink-0' : 'text-blue-600 mt-0.5 flex-shrink-0'} />
                        <div>
                          <strong className="block text-gray-900">Accommodation:</strong>
                          <span className="text-gray-600 text-xs">
                            {activePackage?.packageName === 'Basic' ? 'Not Included (Self-arranged)' : activePackage?.packageName === 'Standard' ? '3-4★ Quality Hotels Included' : '5★ Luxury Resorts Included'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Utensils size={18} className={activePackage?.packageName === 'Premium' ? 'text-green-600 mt-0.5 flex-shrink-0' : 'text-gray-400 mt-0.5 flex-shrink-0'} />
                        <div>
                          <strong className="block text-gray-900">Food & Meals:</strong>
                          <span className="text-gray-600 text-xs">
                            {activePackage?.packageName === 'Premium' 
                              ? `Included: ${customizations.selectedMealOption}` 
                              : activePackage?.packageName === 'Standard' 
                              ? 'Excluded by default (Independent dining)' 
                              : 'Not Included (Self-arranged)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Compass size={18} className={activePackage?.packageName === 'Premium' || customizations.addGuide ? 'text-purple-600 mt-0.5 flex-shrink-0' : 'text-gray-400 mt-0.5 flex-shrink-0'} />
                        <div>
                          <strong className="block text-gray-900">Tour Guide:</strong>
                          <span className="text-gray-600 text-xs">
                            {activePackage?.packageName === 'Premium' 
                              ? `Included: ${customizations.selectedGuideOption}` 
                              : activePackage?.packageName === 'Standard' && customizations.addGuide 
                              ? 'Added as optional service ($45/day)' 
                              : 'Not Included'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Cost Breakdown Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign size={18} className="text-green-600" />
                      Detailed Cost Calculation
                    </h4>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-600">
                          Base Package ({formData.days} days × {formData.travelers} travelers × ${activePackage?.baseCharge || 85}):
                        </span>
                        <span className="font-bold text-gray-900">${currentCost.baseTotal}</span>
                      </div>

                      {currentCost.guideCost > 0 && (
                        <div className="flex justify-between py-1 border-b border-gray-100 text-blue-700">
                          <span>Tour Guide Add-on ({formData.days} days × $45):</span>
                          <span className="font-bold">+${currentCost.guideCost}</span>
                        </div>
                      )}

                      {currentCost.mealExtraCost > 0 && (
                        <div className="flex justify-between py-1 border-b border-gray-100 text-purple-700">
                          <span>Culinary Selection Premium ({customizations.selectedMealOption}):</span>
                          <span className="font-bold">+${currentCost.mealExtraCost}</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-3 text-lg font-extrabold text-gray-900">
                        <span>Total Estimated Cost:</span>
                        <span className="text-2xl text-green-600 font-extrabold">${currentCost.grandTotal}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Wizard Nav Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button 
                    type="button"
                    onClick={handlePrev} 
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
                  >
                    Back
                  </button>
                ) : <div></div>}
                
                {step < 4 ? (
                  <button 
                    type="button"
                    onClick={handleNext} 
                    className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold text-sm shadow-md transition"
                  >
                    Next Step &rarr;
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold text-base shadow-lg transition flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Generating Itinerary...
                      </>
                    ) : (
                      'Generate Complete Plan ✓'
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* FINAL RESULTS VIEW */
            <div className="space-y-8 animate-fadeIn">
              
              {/* Trip Summary Card */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-500/40 text-blue-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-400/30">
                      {results.packageSnapshot?.packageName} Package
                    </span>
                    <span className="text-xs text-blue-200">
                      {formData.days} Days • {formData.travelers} Travelers
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold">Your Personalized Sri Lankan Tour</h2>
                  <p className="text-blue-200 text-sm mt-1">
                    Route planned with GPS-enabled coordinates and package facility compliance.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center md:text-right min-w-[200px]">
                  <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold block">Total Estimated Cost</span>
                  <div className="text-4xl font-extrabold text-green-400 my-1">
                    ${results.estimatedCost}
                  </div>
                  <span className="text-xs text-blue-200 block">All taxes & fees included</span>
                </div>
              </div>

              {/* Package Configuration Confirmation Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-green-600" />
                  Confirmed Package Rules & Inclusions
                </h3>

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1">
                      <Car size={15} /> Transport
                    </div>
                    <p className="text-gray-700 font-medium">Standard Dedicated Vehicle ({formData.vehicleType}) with Chauffeur</p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1">
                      <Home size={15} /> Accommodation
                    </div>
                    <p className="text-gray-700 font-medium">
                      {results.packageSnapshot?.packageName === 'Basic' 
                        ? 'Excluded (Self-arranged)' 
                        : results.packageSnapshot?.packageName === 'Standard' 
                        ? '3-4 Star Handpicked Hotels' 
                        : '5-Star Luxury Resorts & Heritage Villas'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-purple-700 font-bold mb-1">
                      <Utensils size={15} /> Food & Meals
                    </div>
                    <p className="text-gray-700 font-medium">
                      {results.packageSnapshot?.packageName === 'Premium' 
                        ? results.customizationsSnapshot?.selectedMealOption 
                        : results.packageSnapshot?.packageName === 'Standard' 
                        ? 'Excluded by default (Local dining)' 
                        : 'Excluded (Self-arranged)'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                      <Compass size={15} /> Tour Guide
                    </div>
                    <p className="text-gray-700 font-medium">
                      {results.packageSnapshot?.packageName === 'Premium' 
                        ? results.customizationsSnapshot?.selectedGuideOption 
                        : results.customizationsSnapshot?.addGuide 
                        ? 'Guide Add-on Included ($45/day)' 
                        : 'None (Self-guided)'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mapped Itinerary */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Your Interactive Map Route</h3>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative z-0">
                  <MapView destinations={results.destinations} routeCoordinates={routeCoordinates} />
                </div>
                {totalDistance && (
                  <div className="flex flex-wrap gap-6 p-4 bg-blue-50 rounded-xl text-sm border border-blue-100">
                    <div className="text-blue-900">
                      <strong>Total Driving Distance:</strong> {totalDistance}
                    </div>
                    <div className="text-blue-900">
                      <strong>Estimated Road Duration:</strong> {totalDuration}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Daily Destination Itinerary */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Destinations on Your Schedule</h3>
                {results.destinations.length === 0 ? (
                  <p className="text-gray-500 py-4">No destinations matched your criteria entirely, but our tour operators can customize a plan for you!</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.destinations.map((dest, idx) => (
                      <div key={dest._id} className="relative">
                        <div className="absolute top-2 left-2 z-20 bg-blue-900 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                          Day {idx + 1}
                        </div>
                        <DestinationCard destination={dest} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer Actions */}
              <div className="pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                <button 
                  onClick={() => setResults(null)} 
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
                >
                  &larr; Modify Plan Preferences
                </button>

                <button 
                  onClick={() => alert(`Your trip plan with the ${results.packageSnapshot?.packageName} Package has been registered! Check your Dashboard for details.`)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition text-sm"
                >
                  Save Itinerary to Profile
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planner;
