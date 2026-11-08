import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Map as MapIcon,
  Star,
  MapPin,
  ArrowRight,
  Eye,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Globe,
  TrendingUp,
  Zap
} from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import { PackageContext } from '../context/PackageContext';

const Home = () => {
  const navigate = useNavigate();
  const { formatPrice, selectPackage } = useContext(PackageContext);

  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [topGuides, setTopGuides] = useState([]);
  const [topHotels, setTopHotels] = useState([]);
  const [activeDestTab, setActiveDestTab] = useState('popular'); // 'popular', 'most_viewed', 'last_minute'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [destRes, pkgRes, guidesRes, hotelsRes] = await Promise.all([
          api.get('/destinations'),
          api.get('/packages'),
          api.get('/reviews/popular/guide?limit=3'),
          api.get('/reviews/popular/hotel?limit=3')
        ]);

        setDestinations(destRes.data?.data || []);
        const pkgData = pkgRes.data?.data || [];
        const order = { Basic: 1, Standard: 2, Premium: 3 };
        pkgData.sort((a, b) => (order[a.packageName] || 9) - (order[b.packageName] || 9));
        setPackages(pkgData);
        setTopGuides(guidesRes.data?.data || []);
        setTopHotels(hotelsRes.data?.data || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const getFilteredDestinations = () => {
    if (!destinations.length) return [];
    const copy = [...destinations];
    if (activeDestTab === 'most_viewed') {
      return copy.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
    }
    if (activeDestTab === 'last_minute') {
      return copy
        .filter((d) => (d.estimatedDurationHours || 3) <= 3 && (d.entranceFee || 0) <= 25)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
    }
    // default 'popular'
    return copy
      .sort((a, b) => {
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
        return (b.views || 0) - (a.views || 0);
      })
      .slice(0, 6);
  };

  const featuredDestinations = getFilteredDestinations();

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 md:py-32">
        <img
          src="https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1600&auto=format&fit=crop&q=80"
          alt="Sri Lanka Scenic Highlands"
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-indigo-950/75 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-xs">
              <Sparkles size={14} /> Dream Ceylon (Smart Lanka Tourism Planner)
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Discover the Pearl of the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                Indian Ocean
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 mb-8 leading-relaxed max-w-2xl">
              Plan personalized day-by-day Sri Lankan itineraries with smart route optimization,
              holiday-aware scheduling, multi-currency dynamic pricing, and verified local guides & stays.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/planner"
                className="bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold py-3.5 px-8 rounded-xl text-base shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Compass size={20} /> Launch Smart Tour Planner
              </Link>
              <Link
                to="/destinations"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-3.5 px-8 rounded-xl text-base backdrop-blur-xs transition flex items-center gap-2"
              >
                <MapIcon size={18} /> Explore 51+ Destinations
              </Link>
            </div>
          </div>

          {/* Quick Live Platform Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/15">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-400">
                {destinations.length || 51}+
              </span>
              <span className="block text-xs text-blue-200 mt-1 font-medium">
                Curated Sri Lankan Attractions
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-400">3 Tiers</span>
              <span className="block text-xs text-blue-200 mt-1 font-medium">
                Basic, Standard & VIP Packages
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-400">5 Currencies</span>
              <span className="block text-xs text-blue-200 mt-1 font-medium">
                Live USD, LKR, EUR, GBP & AUD Rates
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-400">100% Verified</span>
              <span className="block text-xs text-blue-200 mt-1 font-medium">
                SLTD Guides & Partner Hotels
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                <Compass size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                1. Smart Recommendation
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Personalized destination scoring based on your budget, travel interests, duration, and weather.
              </p>
            </div>

            <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                <MapIcon size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                2. Multi-Stop Route & Map
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Interactive map with road distances, travel duration estimates, and Car, Van, or Motorcycle pricing.
              </p>
            </div>

            <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                3. Holiday-Aware Calendar
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Day-by-day scheduling synchronized with Sri Lankan Poya days, cultural festivals, and public holidays.
              </p>
            </div>

            <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                4. Verified Guides & Stays
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Book certified tour guides and partner hotels with authentic, moderated tourist reviews and ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section (Popular, Most-Viewed & Last-Minute Recommendations - Module 2 & 7) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                Smart Discovery • Module 7
              </span>
              <h2 className="text-3xl font-extrabold text-blue-950 mt-2">
                Trending Sri Lankan Destinations
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Switch between top-rated icons, most-viewed attractions, and quick last-minute escapes.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveDestTab('popular')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeDestTab === 'popular'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Star size={14} className={activeDestTab === 'popular' ? 'text-amber-300' : 'text-amber-500'} />
                Popular Picks
              </button>
              <button
                type="button"
                onClick={() => setActiveDestTab('most_viewed')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeDestTab === 'most_viewed'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp size={14} className={activeDestTab === 'most_viewed' ? 'text-amber-300' : 'text-blue-600'} />
                Most Viewed
              </button>
              <button
                type="button"
                onClick={() => setActiveDestTab('last_minute')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeDestTab === 'last_minute'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Zap size={14} className={activeDestTab === 'last_minute' ? 'text-amber-300' : 'text-emerald-600'} />
                Last-Minute Escapes
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 text-sm">Loading destinations...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDestinations.map((dest) => (
                <div
                  key={dest._id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
                >
                  <div className="h-48 relative overflow-hidden bg-gray-200">
                    <img
                      src={
                        dest.image ||
                        dest.imageUrl ||
                        dest.images?.[0] ||
                        'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={dest.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {(dest.category || []).slice(0, 2).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/90 text-blue-950 shadow-2xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      {Number(dest.rating || 4.5).toFixed(1)}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                      <div>
                        <h3 className="font-extrabold text-lg leading-tight drop-shadow-xs">
                          {dest.name}
                        </h3>
                        <p className="text-xs text-gray-200 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {dest.district || dest.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-blue-600" /> ~
                          {dest.estimatedDurationHours || 3} hrs visit
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={13} className="text-gray-400" /> {dest.views || 0} views
                        </span>
                        <span className="font-bold text-gray-900">
                          {dest.entranceFee ? formatPrice(dest.entranceFee) : 'Free Entry'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to="/destinations"
                          className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                        >
                          View Details
                        </Link>
                        <Link
                          to="/planner"
                          className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1"
                        >
                          Add to Plan <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-2xs hover:shadow transition"
            >
              Browse All {destinations.length || 51} Destinations & Interactive Map{' '}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tour Packages Preview Section (Module 3 & 8) */}
      {packages.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  Transparent Tiered Pricing • Module 3 & 8
                </span>
                <h2 className="text-3xl font-extrabold text-blue-950 mt-2">
                  Flexible Sri Lankan Tour Packages
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  All prices automatically convert to your selected currency in the navigation bar.
                </p>
              </div>
              <Link
                to="/packages"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Compare All Package Features <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition bg-gradient-to-b from-white to-gray-50/50"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {pkg.badge || `${pkg.packageName} Tier`}
                      </span>
                      <span className="text-2xl font-extrabold text-blue-950">
                        {formatPrice(pkg.baseCharge)}
                        <span className="text-xs font-normal text-gray-500">/day</span>
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{pkg.packageName} Package</h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                      {pkg.tagline || pkg.description}
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                      {(pkg.includedFacilities || []).slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        selectPackage(pkg);
                        navigate('/planner');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition"
                    >
                      Plan with {pkg.packageName}
                    </button>
                    <Link
                      to={`/packages/${pkg._id}`}
                      className="py-2.5 px-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Guides & Hotels Section (Module 4 & 5 Popularity Statistics) */}
      {(topGuides.length > 0 || topHotels.length > 0) && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Community Trusted • Modules 4 & 5
              </span>
              <h2 className="text-3xl font-extrabold text-blue-950 mt-2">
                Highest Rated Guides & Partner Stays
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Ranked dynamically using verified tourist ratings and Bayesian review weighting.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top Guides */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Top-Rated Tour Guides</h3>
                  <Link
                    to="/guides"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View All Guides <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {topGuides.map((g) => {
                    const name = g.name || g.userId?.name || 'Certified Guide';
                    return (
                      <Link
                        key={g._id}
                        to="/guides"
                        className="block bg-gray-50 hover:bg-blue-50/40 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition"
                      >
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex items-center gap-3">
                            {g.image ? (
                              <img
                                src={g.image}
                                alt={name}
                                className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center flex-shrink-0">
                                {name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
                              <p className="text-xs text-gray-500">
                                {(g.serviceAreas || []).slice(0, 3).join(', ') || 'Island-wide'} •{' '}
                                <strong className="text-blue-900">{formatPrice(g.dailyRate)}</strong>
                                /day
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <StarRating rating={g.rating || 0} size={14} />
                            <span className="block text-xs font-bold text-gray-700 mt-0.5">
                              {Number(g.rating || 0).toFixed(1)} ({g.reviewCount || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Top Hotels */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Top-Rated Partner Hotels</h3>
                  <Link
                    to="/hotels"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View All Hotels <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {topHotels.map((h) => (
                    <Link
                      key={h._id}
                      to="/hotels"
                      className="block bg-gray-50 hover:bg-blue-50/40 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          {(h.image || h.imageUrl) ? (
                            <img
                              src={h.image || h.imageUrl}
                              alt={h.name}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white font-bold flex items-center justify-center flex-shrink-0">
                              {h.name?.charAt(0) || 'H'}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{h.name}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={11} /> {h.location} •{' '}
                              <strong className="text-blue-900">{formatPrice(h.pricePerNight)}</strong>
                              /night
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <StarRating rating={h.rating || 0} size={14} />
                          <span className="block text-xs font-bold text-gray-700 mt-0.5">
                            {Number(h.rating || 0).toFixed(1)} ({h.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
