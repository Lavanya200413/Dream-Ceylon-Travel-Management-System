import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  MessageSquare,
  LogIn,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import RatingSummary from './RatingSummary';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';

/**
 * Complete review and rating panel for a Destination, Guide, or Hotel.
 * Supports:
 * - Accurate rating summary & 5-1 star distribution
 * - Booking eligibility verification before review submission
 * - Sorting (Most recent, Highest rated, Lowest rated) & star filtering
 * - Controlled pagination ("Load More")
 */
const ReviewList = ({
  targetType,
  targetId,
  targetName,
  onRatingUpdated
}) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [completingDemo, setCompletingDemo] = useState(false);

  // Sorting, filtering & controlled loading state
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest' | 'lowest'
  const [starFilter, setStarFilter] = useState('all'); // 'all' | '5' | '4' | '3' | '2' | '1'
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const fetchReviewsAndStats = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        sort: sortBy,
        limit: '50'
      });
      if (starFilter !== 'all') queryParams.set('star', starFilter);
      if (verifiedOnly) queryParams.set('verifiedOnly', 'true');

      const requests = [
        api.get(`/reviews/target/${targetType}/${targetId}?${queryParams.toString()}`),
        api.get(`/reviews/ratings/${targetType}/${targetId}`)
      ];

      if (user) {
        requests.push(
          api
            .get(`/reviews/eligibility/${targetType}/${targetId}`)
            .catch(() => ({ data: { data: null } }))
        );
      }

      const [reviewsRes, statsRes, eligRes] = await Promise.all(requests);
      const fetchedReviews = reviewsRes.data?.data || [];
      const fetchedStats = statsRes.data?.data || null;

      setReviews(fetchedReviews);
      setStats(fetchedStats);
      if (eligRes?.data?.data) {
        setEligibility(eligRes.data.data);
      }

      if (onRatingUpdated && fetchedStats) {
        onRatingUpdated(targetId, fetchedStats);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId, sortBy, starFilter, verifiedOnly, user]);

  useEffect(() => {
    fetchReviewsAndStats();
  }, [fetchReviewsAndStats]);

  const currentUserId = user?.id || user?._id;
  const userExistingReview =
    eligibility?.existingReview ||
    reviews.find((r) => {
      const rAuthor = r.authorId?._id || r.authorId;
      return currentUserId && rAuthor && rAuthor.toString() === currentUserId.toString();
    });

  const handleReviewSuccess = () => {
    setEditingReview(null);
    fetchReviewsAndStats();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviewsAndStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const handleCompleteServiceExperience = async () => {
    setCompletingDemo(true);
    try {
      await api.post('/reviews/complete-experience', {
        targetType,
        targetId
      });
      await fetchReviewsAndStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record completed booking');
    } finally {
      setCompletingDemo(false);
    }
  };

  const displayedReviews = reviews.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Rating Summary & Distribution */}
      <RatingSummary
        stats={stats}
        loading={loading}
        selectedStar={starFilter}
        onSelectStar={(star) => {
          setStarFilter(star);
          setVisibleCount(5);
        }}
      />

      {/* Review Submission / Eligibility Section */}
      {user ? (
        user.role === 'tourist' || user.role === 'admin' ? (
          editingReview ? (
            <ReviewForm
              targetType={targetType}
              targetId={targetId}
              targetName={targetName}
              initialReview={editingReview}
              onSuccess={handleReviewSuccess}
              onCancelEdit={() => setEditingReview(null)}
            />
          ) : userExistingReview ? (
            <div className="bg-blue-50/70 border border-blue-200 px-4 py-3 rounded-xl flex justify-between items-center text-xs text-blue-900">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-blue-600" />
                You have already submitted a review for this {targetType}.
              </span>
              <button
                type="button"
                onClick={() => setEditingReview(userExistingReview)}
                className="font-bold text-blue-700 hover:underline"
              >
                Edit Your Review
              </button>
            </div>
          ) : eligibility && !eligibility.eligible ? (
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={17} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Verified Experience Required to Review</span>
                  <span className="text-amber-800">{eligibility.reason}</span>
                </div>
              </div>
              {(targetType === 'guide' || targetType === 'hotel') && (
                <button
                  type="button"
                  disabled={completingDemo}
                  onClick={handleCompleteServiceExperience}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition flex-shrink-0 disabled:opacity-50"
                >
                  <ShieldCheck size={14} />
                  {completingDemo
                    ? 'Verifying...'
                    : eligibility.hasPendingBooking
                    ? 'Mark My Booking Completed'
                    : 'Complete Service Booking to Review'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {eligibility && (
                <div className="flex items-center justify-between text-xs px-1">
                  {eligibility.verifiedBooking ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                      <ShieldCheck size={13} /> Verified Booking / Itinerary Experience Confirmed
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      Submitting a public {targetType} review (Verified badge is awarded when linked to a completed booking/itinerary)
                    </span>
                  )}
                </div>
              )}
              <ReviewForm
                targetType={targetType}
                targetId={targetId}
                targetName={targetName}
                onSuccess={handleReviewSuccess}
              />
            </div>
          )
        ) : (
          <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-xs text-gray-600">
            Only registered Tourist accounts can submit new reviews.
          </div>
        )
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-gray-600">
            Sign in with a Tourist account to rate and review this {targetType}.
          </span>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600 text-white px-3.5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <LogIn size={13} /> Login to Review
          </Link>
        </div>
      )}

      {/* Sort & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 mr-2">
            <MessageSquare size={16} className="text-blue-600" />
            Tourist Reviews ({reviews.length})
          </h4>

          {/* Star Filter Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {['all', '5', '4', '3', '2', '1'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStarFilter(st);
                  setVisibleCount(5);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  starFilter === st
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'all' ? 'All' : `${st}★`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setVisibleCount(5);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Verified Only
          </label>

          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white text-gray-800"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="highest">Sort: Highest Rated</option>
              <option value="lowest">Sort: Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Individual Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-sm text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
            <MessageSquare size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">
              {starFilter !== 'all' || verifiedOnly
                ? 'No reviews match the selected filter'
                : 'No reviews yet'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {starFilter !== 'all' || verifiedOnly
                ? 'Try clearing the star or verified filter to see all feedback.'
                : `Be the first tourist to share your experience with ${targetName || `this ${targetType}`}!`}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedReviews.map((rev) => (
                <ReviewCard
                  key={rev._id}
                  review={rev}
                  currentUser={user}
                  onEdit={(r) => setEditingReview(r)}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>

            {reviews.length > visibleCount && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition"
                >
                  <ChevronDown size={14} />
                  Load More Reviews ({reviews.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
