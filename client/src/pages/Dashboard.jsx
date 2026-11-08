import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PackageContext } from '../context/PackageContext';
import { Navigate, Link } from 'react-router-dom';
import {
  User,
  Map,
  CreditCard,
  Star,
  Edit2,
  Trash2,
  Building2,
  Compass,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Plus,
  MapPin,
  Globe,
  Phone,
  Sparkles,
  Clock
} from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import AdminReportedReviews from '../components/AdminReportedReviews';
import GuideManagementModal from '../components/GuideManagementModal';
import HotelManagementModal from '../components/HotelManagementModal';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const { formatPrice } = useContext(PackageContext);

  // Tourist state
  const [myPlans, setMyPlans] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Guide state
  const [myGuideProfile, setMyGuideProfile] = useState(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Hotel Owner state
  const [myHotels, setMyHotels] = useState([]);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [hotelToEdit, setHotelToEdit] = useState(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      if (user.role === 'tourist') {
        const [plansRes, bookRes, revRes] = await Promise.all([
          api.get('/planner/my-plans').catch(() => ({ data: { data: [] } })),
          api.get('/bookings').catch(() => ({ data: { data: [] } })),
          api.get('/reviews/my-reviews').catch(() => ({ data: { data: [] } }))
        ]);
        setMyPlans(plansRes.data?.data || []);
        setMyBookings(bookRes.data?.data || []);
        setMyReviews(revRes.data?.data || []);
      } else if (user.role === 'guide') {
        const [profRes, bookRes] = await Promise.all([
          api.get('/guides/my-profile').catch(() => ({ data: { data: null } })),
          api.get('/bookings').catch(() => ({ data: { data: [] } }))
        ]);
        setMyGuideProfile(profRes.data?.data || null);
        setMyBookings(bookRes.data?.data || []);
      } else if (user.role === 'hotel_owner') {
        const [hotelsRes, bookRes] = await Promise.all([
          api.get('/hotels/my-hotels').catch(() => ({ data: { data: [] } })),
          api.get('/bookings').catch(() => ({ data: { data: [] } }))
        ]);
        setMyHotels(hotelsRes.data?.data || []);
        setMyBookings(bookRes.data?.data || []);
      } else if (user.role === 'admin') {
        const bookRes = await api.get('/bookings').catch(() => ({ data: { data: [] } }));
        setMyBookings(bookRes.data?.data || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Remove this saved tour plan from your schedule?')) return;
    try {
      await api.delete(`/planner/${planId}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete tour plan.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update booking status.');
    }
  };

  const handleDeleteMyReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const handleDeleteMyHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel property?')) return;
    try {
      await api.delete(`/hotels/${hotelId}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete hotel');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const roleLabels = {
    tourist: 'Tourist',
    guide: 'Certified Tour Guide',
    hotel_owner: 'Hotel Partner',
    admin: 'System Administrator'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 rounded-3xl shadow-lg p-8 text-white flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-3 py-1 rounded-full">
            Dream Ceylon (Smart Lanka Tourism Planner)
          </span>
          <h1 className="text-3xl font-extrabold mt-2 mb-1">Welcome Back, {user.name}!</h1>
          <p className="text-blue-200 text-sm">
            Manage your personalized Sri Lankan schedules, service bookings, profiles, and verified ratings.
          </p>
        </div>
        <div className="bg-white/15 px-4 py-2.5 rounded-xl backdrop-blur-xs border border-white/25 text-sm font-bold tracking-wide">
          Account Role: {roleLabels[user.role] || user.role}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <User size={16} className="text-blue-600" /> Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link
                  to="/planner"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition flex items-center gap-2.5"
                >
                  <Map size={16} className="text-blue-600" /> Smart Journey Planner
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition flex items-center gap-2.5"
                >
                  <MapPin size={16} className="text-emerald-600" /> Explore 51+ Destinations
                </Link>
              </li>
              <li>
                <Link
                  to="/packages"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition flex items-center gap-2.5"
                >
                  <Sparkles size={16} className="text-purple-600" /> Tour Packages & Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition flex items-center gap-2.5"
                >
                  <Compass size={16} className="text-amber-600" /> Certified Tour Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/hotels"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition flex items-center gap-2.5"
                >
                  <Building2 size={16} className="text-indigo-600" /> Partner Hotels & Stays
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-3 space-y-8">
          {/* ==========================================
              TOURIST WORKSPACE
             ========================================== */}
          {user.role === 'tourist' && (
            <div className="space-y-8">
              {/* Summary Metrics */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl text-white shadow-sm">
                  <Calendar className="mb-3 opacity-85" size={28} />
                  <h4 className="text-sm font-semibold text-emerald-100">Saved Tour Plans</h4>
                  <p className="text-3xl font-extrabold mt-1">{myPlans.length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-sm">
                  <CreditCard className="mb-3 opacity-85" size={28} />
                  <h4 className="text-sm font-semibold text-blue-100">Confirmed Bookings</h4>
                  <p className="text-3xl font-extrabold mt-1">{myBookings.length}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-sm">
                  <Star className="mb-3 opacity-85" size={28} />
                  <h4 className="text-sm font-semibold text-amber-100">Reviews Submitted</h4>
                  <p className="text-3xl font-extrabold mt-1">{myReviews.length}</p>
                </div>
              </div>

              {/* 1. Saved Tour Plans & Smart Schedules (Modules 1 & 6) */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Calendar size={20} className="text-blue-600" />
                      My Saved Tour Schedules & Itineraries
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Day-by-day Sri Lankan itineraries generated with the Smart Planner.
                    </p>
                  </div>
                  <Link
                    to="/planner"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Create New Plan
                  </Link>
                </div>

                {myPlans.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Map size={32} className="mx-auto text-gray-300 mb-2" />
                    <h4 className="font-bold text-gray-800 text-sm">No saved itineraries yet</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Use the Smart Planner to build a personalized route and save it to your calendar.
                    </p>
                    <Link
                      to="/planner"
                      className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Launch Smart Planner
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myPlans.map((plan) => (
                      <div
                        key={plan._id}
                        className="p-5 rounded-2xl border border-gray-200 hover:border-blue-300 bg-gray-50/50 transition space-y-3"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                {plan.packageName || 'Standard'} Package
                              </span>
                              <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                <Clock size={12} /> {plan.days} Days • {plan.travelers || 2} Travelers
                              </span>
                              <span className="text-xs text-gray-500">
                                Vehicle: <strong>{plan.transportType || 'Car'}</strong>
                              </span>
                            </div>
                            <h4 className="text-lg font-extrabold text-gray-900 mt-1">
                              {plan.title || `${plan.days}-Day Sri Lanka Tour`}
                            </h4>
                            {plan.startDate && (
                              <p className="text-xs text-blue-700 font-semibold mt-0.5">
                                Travel Dates:{' '}
                                {new Date(plan.startDate).toLocaleDateString()} &rarr;{' '}
                                {plan.endDate
                                  ? new Date(plan.endDate).toLocaleDateString()
                                  : `${plan.days} days`}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {plan.estimatedCost > 0 && (
                              <div className="text-right">
                                <span className="text-lg font-extrabold text-green-700">
                                  {formatPrice(plan.estimatedCost)}
                                </span>
                                <span className="block text-[10px] text-gray-400">Est. Total</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePlan(plan._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete Plan"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Destinations list */}
                        {plan.destinations && plan.destinations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200/70">
                            {plan.destinations.map((dest, idx) => (
                              <span
                                key={dest._id || idx}
                                className="text-xs font-semibold bg-white border border-gray-200 text-gray-800 px-2.5 py-1 rounded-lg flex items-center gap-1"
                              >
                                <span className="text-blue-600 font-bold">D{idx + 1}:</span>{' '}
                                {dest.name || 'Destination'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Service & Trip Bookings (Modules 3, 4 & 5) */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard size={20} className="text-blue-600" />
                      My Confirmed Bookings (Guides, Hotels & Packages)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Bookings with status <strong>confirmed</strong> or <strong>completed</strong> unlock verified review privileges.
                    </p>
                  </div>
                </div>

                {myBookings.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold">No service bookings yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Book a certified guide, partner hotel, or full tour plan to manage it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myBookings.map((b) => {
                      const serviceTitle =
                        b.hotelId?.name ||
                        b.guideId?.name ||
                        b.tourPlanId?.title ||
                        b.packageId?.packageName ||
                        'Sri Lanka Tourism Booking';
                      const serviceType = b.hotelId
                        ? 'Partner Hotel'
                        : b.guideId
                        ? 'Tour Guide'
                        : 'Tour Package / Itinerary';

                      return (
                        <div
                          key={b._id}
                          className="p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                {serviceType}
                              </span>
                              <span
                                className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                  b.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : b.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{serviceTitle}</h4>
                            <p className="text-xs text-gray-500">
                              Booked on {new Date(b.bookingDate || b.createdAt).toLocaleDateString()} •{' '}
                              <strong className="text-gray-800">
                                {formatPrice(b.totalPrice || 0)}
                              </strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {b.status === 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                                className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                              >
                                <CheckCircle2 size={13} /> Mark Completed
                              </button>
                            )}
                            {b.guideId && (
                              <Link
                                to="/guides"
                                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                              >
                                Rate Guide
                              </Link>
                            )}
                            {b.hotelId && (
                              <Link
                                to="/hotels"
                                className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                              >
                                Rate Hotel
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. My Submitted Reviews Section (Module 5) */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Star size={20} className="text-yellow-500 fill-yellow-400" />
                      My Reviews & Ratings
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage the reviews you have shared for destinations, tour guides, and partner hotels.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/guides"
                      className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition"
                    >
                      Review a Guide
                    </Link>
                    <Link
                      to="/hotels"
                      className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition"
                    >
                      Review a Hotel
                    </Link>
                  </div>
                </div>

                {editingReview && (
                  <ReviewForm
                    targetType={editingReview.targetType}
                    targetId={editingReview.targetId}
                    targetName={editingReview.targetName}
                    initialReview={editingReview}
                    onSuccess={() => {
                      setEditingReview(null);
                      fetchDashboardData();
                    }}
                    onCancelEdit={() => setEditingReview(null)}
                  />
                )}

                {loadingData ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    Loading your reviews...
                  </div>
                ) : myReviews.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Star size={36} className="mx-auto text-gray-300 mb-2" />
                    <h4 className="font-bold text-gray-800">No reviews submitted yet</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Visit the Destinations, Guides, or Hotels pages to rate services you have experienced.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Link
                        to="/guides"
                        className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Browse Guides
                      </Link>
                      <Link
                        to="/hotels"
                        className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Browse Hotels
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                              {rev.targetType}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">
                              {rev.targetName}
                            </span>
                            {rev.status === 'hidden' && (
                              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Hidden by Moderator
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              • {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <StarRating rating={rev.score} size={15} />
                          <p className="text-sm text-gray-700 pt-1">{rev.comment}</p>
                        </div>

                        <div className="flex sm:flex-col justify-end gap-2 flex-shrink-0">
                          {rev.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => setEditingReview(rev)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteMyReview(rev._id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TOUR GUIDE WORKSPACE (MODULE 4)
             ========================================== */}
          {user.role === 'guide' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Compass size={20} className="text-blue-600" />
                      My Certified Tour Guide Profile
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Keep your daily rate, languages, service areas, and availability up to date for tourists.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGuideModalOpen(true)}
                    className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Edit2 size={14} />
                    {myGuideProfile ? 'Edit Guide Profile' : 'Register Guide Profile'}
                  </button>
                </div>

                {!myGuideProfile ? (
                  <div className="p-8 text-center bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
                    <Compass size={36} className="mx-auto text-blue-600 mb-2" />
                    <h3 className="font-bold text-gray-900">
                      You have not published your Tour Guide Profile yet
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 mb-4">
                      Click below to register your service areas, spoken languages, and daily rate.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsGuideModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
                    >
                      Create Guide Profile Now
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        {myGuideProfile.image ? (
                          <img
                            src={myGuideProfile.image}
                            alt={myGuideProfile.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white font-extrabold text-xl flex items-center justify-center">
                            {(myGuideProfile.name || user.name).charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-extrabold text-gray-900">
                              {myGuideProfile.name || user.name}
                            </h3>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                myGuideProfile.availability
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {myGuideProfile.availability ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={myGuideProfile.rating || 0} size={15} />
                            <span className="text-xs font-bold text-gray-700">
                              {Number(myGuideProfile.rating || 0).toFixed(1)} (
                              {myGuideProfile.reviewCount || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-blue-900">
                          {formatPrice(myGuideProfile.dailyRate)}
                        </span>
                        <span className="block text-xs text-gray-500">per day</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{myGuideProfile.bio}</p>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <strong className="block text-gray-900">Service Areas</strong>
                        <span className="text-gray-600">
                          {(myGuideProfile.serviceAreas || []).join(', ')}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <strong className="block text-gray-900">Languages</strong>
                        <span className="text-gray-600">
                          {(myGuideProfile.languages || []).join(', ')}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <strong className="block text-gray-900">Contact Phone</strong>
                        <span className="text-gray-600">
                          {myGuideProfile.phone || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <GuideManagementModal
                isOpen={isGuideModalOpen}
                onClose={() => setIsGuideModalOpen(false)}
                existingProfile={myGuideProfile}
                onProfileUpdated={(updated) => {
                  setMyGuideProfile(updated);
                  fetchDashboardData();
                }}
              />
            </div>
          )}

          {/* ==========================================
              HOTEL OWNER WORKSPACE (MODULE 4)
             ========================================== */}
          {user.role === 'hotel_owner' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Building2 size={20} className="text-blue-600" />
                      My Partner Hotel Properties ({myHotels.length})
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Register new hotels, update room inventory & nightly pricing, and monitor guest ratings.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHotelToEdit(null);
                      setIsHotelModalOpen(true);
                    }}
                    className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add New Hotel
                  </button>
                </div>

                {myHotels.length === 0 ? (
                  <div className="p-8 text-center bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
                    <Building2 size={36} className="mx-auto text-blue-600 mb-2" />
                    <h3 className="font-bold text-gray-900">No partner hotels registered yet</h3>
                    <p className="text-xs text-gray-600 mt-1 mb-4">
                      Add your hotel property to make it discoverable to tourists across Sri Lanka.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setHotelToEdit(null);
                        setIsHotelModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
                    >
                      Register First Hotel
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {myHotels.map((h) => (
                      <div
                        key={h._id}
                        className="p-5 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="font-extrabold text-gray-900 text-base">{h.name}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={12} /> {h.location}
                              </p>
                            </div>
                            <span className="text-lg font-extrabold text-blue-900">
                              {formatPrice(h.pricePerNight)}
                              <span className="text-[10px] font-normal text-gray-500">/night</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <StarRating rating={h.rating || 0} size={14} />
                            <span className="text-xs font-bold text-gray-700">
                              {Number(h.rating || 0).toFixed(1)} ({h.reviewCount || 0} reviews)
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              setHotelToEdit(h);
                              setIsHotelModalOpen(true);
                            }}
                            className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMyHotel(h._id)}
                            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <HotelManagementModal
                isOpen={isHotelModalOpen}
                onClose={() => setIsHotelModalOpen(false)}
                hotelToEdit={hotelToEdit}
                onHotelSaved={() => fetchDashboardData()}
              />
            </div>
          )}

          {/* ==========================================
              ADMIN MODERATION WORKSPACE (MODULE 5)
             ========================================== */}
          {user.role === 'admin' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ShieldAlert size={24} className="text-blue-900" />
                  Administrator Moderation Panel
                </h2>
              </div>
              <AdminReportedReviews />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
