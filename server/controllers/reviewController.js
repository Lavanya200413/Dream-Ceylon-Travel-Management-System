const mongoose = require('mongoose');
const Review = require('../models/Review');
const Destination = require('../models/Destination');
const Guide = require('../models/Guide');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const TourPlan = require('../models/TourPlan');
const {
  PUBLISHED_STATUSES,
  normalizeTargetType,
  recalculateTargetRating,
  getPopularTargets,
  getOverallRatingsSummary
} = require('../services/ratingService');

const targetLabel = (type) => {
  if (type === 'destination') return 'Destination';
  if (type === 'guide') return 'Guide';
  if (type === 'hotel') return 'Hotel';
  return 'Service';
};

// Helper: verify target exists in database
const findTargetEntity = async (normalizedType, targetId) => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) return null;
  if (normalizedType === 'destination') {
    return await Destination.findById(targetId);
  }
  if (normalizedType === 'guide') {
    return await Guide.findById(targetId).populate('userId', 'name email');
  }
  if (normalizedType === 'hotel') {
    return await Hotel.findById(targetId).populate('ownerId', 'name email');
  }
  return null;
};

// Helper: enrich a review object with targetName & targetDetails
const enrichReviewWithTarget = async (rev) => {
  let targetName = 'Unknown Target';
  let targetDetails = null;

  if (rev.targetType === 'destination') {
    const dest = await Destination.findById(rev.targetId)
      .select('name district province category rating reviewCount image imageUrl')
      .lean();
    if (dest) {
      targetName = `${dest.name} (${dest.district})`;
      targetDetails = dest;
    }
  } else if (rev.targetType === 'hotel') {
    const hotel = await Hotel.findById(rev.targetId)
      .select('name location pricePerNight rating reviewCount')
      .lean();
    if (hotel) {
      targetName = `${hotel.name} (${hotel.location})`;
      targetDetails = hotel;
    }
  } else if (rev.targetType === 'guide') {
    const guide = await Guide.findById(rev.targetId).populate('userId', 'name').lean();
    if (guide) {
      targetName = guide.name || guide.userId?.name || 'Certified Tour Guide';
      targetDetails = guide;
    }
  }

  return {
    ...rev,
    targetName,
    targetDetails
  };
};

// Helper: check review eligibility for a tourist on a target
const evaluateReviewEligibility = async (userId, normalizedType, targetId) => {
  const existingReview = await Review.findOne({
    authorId: userId,
    targetType: normalizedType,
    targetId,
    status: { $nin: ['removed', 'rejected'] }
  });

  if (normalizedType === 'guide' || normalizedType === 'hotel') {
    const bookingField = normalizedType === 'guide' ? 'guideId' : 'hotelId';
    const matchingBookings = await Booking.find({
      touristId: userId,
      [bookingField]: targetId,
      status: { $ne: 'Cancelled' }
    }).sort({ createdAt: -1 });

    const completedBooking = matchingBookings.find((b) => b.status === 'Completed');
    const confirmedBooking = matchingBookings.find((b) => b.status === 'Confirmed');
    const pendingBooking = matchingBookings.find((b) => b.status === 'Pending');

    const eligibleBooking = completedBooking || confirmedBooking;

    if (eligibleBooking) {
      return {
        eligible: !existingReview,
        alreadyReviewed: Boolean(existingReview),
        existingReview: existingReview || null,
        verifiedBooking: true,
        bookingId: eligibleBooking._id,
        bookingStatus: eligibleBooking.status,
        hasPendingBooking: false,
        eligibilityMode: 'verified_service_booking',
        reason: existingReview
          ? 'You have already submitted a review for this service.'
          : 'Verified completed/confirmed booking found for this service.'
      };
    }

    if (pendingBooking) {
      return {
        eligible: false,
        alreadyReviewed: Boolean(existingReview),
        existingReview: existingReview || null,
        verifiedBooking: false,
        bookingId: null,
        pendingBookingId: pendingBooking._id,
        bookingStatus: 'Pending',
        hasPendingBooking: true,
        eligibilityMode: 'verified_service_booking',
        reason:
          'Your booking for this service is still Pending. You can submit a review once the booking is Completed.'
      };
    }

    return {
      eligible: false,
      alreadyReviewed: Boolean(existingReview),
      existingReview: existingReview || null,
      verifiedBooking: false,
      bookingId: null,
      bookingStatus: null,
      hasPendingBooking: false,
      eligibilityMode: 'verified_service_booking',
      reason: `You can only submit a review after completing a booking with this ${normalizedType}.`
    };
  }

  // Destination eligibility check:
  // 1. Check if tourist has a TourPlan containing this destination in `stops`
  // 2. Check if tourist has a Completed/Confirmed Booking linked to that TourPlan
  const matchingPlans = await TourPlan.find({
    touristId: userId,
    stops: targetId
  }).select('_id dates');

  let verifiedDestinationBooking = null;
  if (matchingPlans.length > 0) {
    const planIds = matchingPlans.map((p) => p._id);
    verifiedDestinationBooking = await Booking.findOne({
      touristId: userId,
      tourPlanId: { $in: planIds },
      status: { $in: ['Completed', 'Confirmed'] }
    }).sort({ createdAt: -1 });
  }

  const isVerifiedVisit = Boolean(verifiedDestinationBooking || matchingPlans.length > 0);

  return {
    eligible: !existingReview,
    alreadyReviewed: Boolean(existingReview),
    existingReview: existingReview || null,
    verifiedBooking: isVerifiedVisit,
    bookingId: verifiedDestinationBooking ? verifiedDestinationBooking._id : null,
    bookingStatus: verifiedDestinationBooking
      ? verifiedDestinationBooking.status
      : matchingPlans.length > 0
      ? 'In Tour Itinerary'
      : 'Standalone Public Visit',
    hasPendingBooking: false,
    eligibilityMode: isVerifiedVisit
      ? 'verified_itinerary_visit'
      : 'open_public_destination',
    reason: existingReview
      ? 'You have already reviewed this destination.'
      : isVerifiedVisit
      ? 'Verified destination included in your Sri Lanka tour itinerary.'
      : 'Public destination review eligible (standalone attraction visit; verified badge is reserved for bookings/itineraries).'
  };
};

// @desc    Check authenticated user's review eligibility for a target
// @route   GET /api/reviews/eligibility/:targetType/:targetId
// @access  Private
exports.checkReviewEligibility = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const normalizedType = normalizeTargetType(targetType);

    if (!normalizedType || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetType or targetId.'
      });
    }

    const targetEntity = await findTargetEntity(normalizedType, targetId);
    if (!targetEntity) {
      return res.status(404).json({
        success: false,
        error: `${targetLabel(normalizedType)} not found.`
      });
    }

    const eligibility = await evaluateReviewEligibility(req.user.id, normalizedType, targetId);

    res.status(200).json({
      success: true,
      data: {
        ...eligibility,
        canReview: Boolean(eligibility.eligible)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Complete or record a service booking experience for a tourist (for seamless review testing)
// @route   POST /api/reviews/complete-experience
// @access  Private (tourist)
exports.completeServiceExperience = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const normalizedType = normalizeTargetType(targetType);

    if (!normalizedType || !['guide', 'hotel'].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        error: 'targetType must be guide or hotel.'
      });
    }

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid targetId is required.'
      });
    }

    const targetEntity = await findTargetEntity(normalizedType, targetId);
    if (!targetEntity) {
      return res.status(404).json({
        success: false,
        error: `${targetLabel(normalizedType)} not found.`
      });
    }

    const bookingField = normalizedType === 'guide' ? 'guideId' : 'hotelId';
    let booking = await Booking.findOne({
      touristId: req.user.id,
      [bookingField]: targetId,
      status: { $ne: 'Cancelled' }
    }).sort({ createdAt: -1 });

    if (booking) {
      booking.status = 'Completed';
      await booking.save();
    } else {
      const unitPrice =
        normalizedType === 'guide'
          ? Number(targetEntity.dailyRate) || 50
          : Number(targetEntity.pricePerNight) || 120;
      booking = await Booking.create({
        touristId: req.user.id,
        [bookingField]: targetId,
        status: 'Completed',
        totalAmount: unitPrice
      });
    }

    res.status(200).json({
      success: true,
      message: `Completed booking recorded for ${
        targetEntity.name || targetLabel(normalizedType)
      }. You are now eligible to submit a verified review.`,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a review for a destination, guide, or hotel
// @route   POST /api/reviews
// @access  Private (tourist)
exports.createReview = async (req, res) => {
  try {
    const { targetType, targetId, score, comment } = req.body;

    // 1. Validate targetType against explicit allowlist
    const normalizedType = normalizeTargetType(targetType);
    if (!normalizedType) {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetType. Must be "destination", "guide", or "hotel".'
      });
    }

    // 2. Validate targetId is a valid MongoDB ObjectId
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetId provided.'
      });
    }

    // 3. Validate rating score (integer 1..5)
    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating score must be a whole number between 1 and 5.'
      });
    }

    // 4. Validate comment
    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid review comment (at least 3 characters).'
      });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Review comment cannot exceed 1000 characters.'
      });
    }

    // 5. Ensure target Destination, Guide, or Hotel exists
    const targetEntity = await findTargetEntity(normalizedType, targetId);
    if (!targetEntity) {
      return res.status(404).json({
        success: false,
        error: `${targetLabel(normalizedType)} not found.`
      });
    }

    // 6. Prevent self-review if user is also the owner/guide
    if (normalizedType === 'guide' || normalizedType === 'hotel') {
      const ownerUserId =
        normalizedType === 'guide'
          ? targetEntity.userId?._id?.toString() || targetEntity.userId?.toString()
          : targetEntity.ownerId?._id?.toString() || targetEntity.ownerId?.toString();
      if (ownerUserId && ownerUserId === req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You cannot submit a review for your own service.'
        });
      }
    }

    // 7. Prevent duplicate review by the same tourist for the same target
    const existingReview = await Review.findOne({
      authorId: req.user.id,
      targetType: normalizedType,
      targetId: targetId,
      status: { $nin: ['removed', 'rejected'] }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error:
          'You have already submitted a review for this item. You can edit your existing review instead.'
      });
    }

    // 8. Verify review eligibility (Section 4.B)
    const eligibility = await evaluateReviewEligibility(req.user.id, normalizedType, targetId);
    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        error: eligibility.reason,
        eligibility
      });
    }

    // Prevent duplicate review for the same bookingId on the same targetType
    if (eligibility.bookingId) {
      const duplicateBookingReview = await Review.findOne({
        authorId: req.user.id,
        targetType: normalizedType,
        bookingId: eligibility.bookingId,
        status: { $nin: ['removed', 'rejected'] }
      });
      if (duplicateBookingReview) {
        return res.status(400).json({
          success: false,
          error: 'A review has already been submitted for this completed booking.'
        });
      }
    }

    // 9. Create review safely (prevent mass assignment of status, moderation, or authorId)
    const review = await Review.create({
      authorId: req.user.id,
      targetType: normalizedType,
      targetId,
      score: numericScore,
      comment: comment.trim(),
      verifiedBooking: eligibility.verifiedBooking,
      bookingId: eligibility.bookingId,
      status: 'active'
    });

    await review.populate('authorId', 'name profileImage role');

    // 10. Recalculate and synchronize target rating & reviewCount
    const ratingStats = await recalculateTargetRating(normalizedType, targetId);

    res.status(201).json({
      success: true,
      data: review,
      ratingStats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get published reviews for a target or single review by ID, with sorting, star filter & pagination
// @route   GET /api/reviews/target/:targetType/:targetId
// @route   GET /api/reviews/:targetType/:targetId
// @route   GET /api/reviews/:id
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    // Check if GET /api/reviews/:id was called for a single Review document ID
    if (req.params.id && !req.params.targetType && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const singleReview = await Review.findById(req.params.id)
        .populate('authorId', 'name profileImage role')
        .select('-reports -moderationHistory')
        .lean();

      if (singleReview && PUBLISHED_STATUSES.includes(singleReview.status)) {
        const enrichedSingle = await enrichReviewWithTarget(singleReview);
        return res.status(200).json({
          success: true,
          data: enrichedSingle
        });
      }
    }

    const filter = { status: { $in: PUBLISHED_STATUSES } };

    const rawType = req.params.targetType || req.query.targetType;
    const rawTargetId = req.params.targetId || req.params.id || req.query.targetId;

    if (rawType) {
      const normalizedType = normalizeTargetType(rawType);
      if (!normalizedType) {
        return res.status(400).json({
          success: false,
          error: 'Invalid targetType. Must be "destination", "guide", or "hotel".'
        });
      }
      filter.targetType = normalizedType;
    }

    if (rawTargetId) {
      if (!mongoose.Types.ObjectId.isValid(rawTargetId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid targetId format.'
        });
      }
      filter.targetId = rawTargetId;
    }

    // Optional star rating filter (?star=5)
    if (req.query.star !== undefined && req.query.star !== '' && req.query.star !== 'all') {
      const starFilter = Number(req.query.star);
      if (Number.isInteger(starFilter) && starFilter >= 1 && starFilter <= 5) {
        filter.score = starFilter;
      }
    }

    // Optional verifiedBooking filter (?verifiedOnly=true)
    if (req.query.verifiedOnly === 'true') {
      filter.verifiedBooking = true;
    }

    // Sorting: 'recent' (default), 'highest', 'lowest'
    const sortParam = (req.query.sort || 'recent').toString().toLowerCase();
    let sortOption = { createdAt: -1 };
    if (sortParam === 'highest' || sortParam === 'rating_high') {
      sortOption = { score: -1, createdAt: -1 };
    } else if (sortParam === 'lowest' || sortParam === 'rating_low') {
      sortOption = { score: 1, createdAt: -1 };
    }

    const total = await Review.countDocuments(filter);

    // Optional pagination (?page=1&limit=10)
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit
      ? Math.max(1, Math.min(100, parseInt(req.query.limit, 10)))
      : 50;
    const skip = (page - 1) * limit;

    const reviews = await Review.find(filter)
      .populate('authorId', 'name profileImage role')
      .select('-reports -moderationHistory')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasMore: skip + reviews.length < total
      },
      data: reviews
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get rating statistics & star distribution for a destination, guide, or hotel
// @route   GET /api/reviews/ratings/:targetType/:targetId
// @access  Public
exports.getTargetRatingStats = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const normalizedType = normalizeTargetType(targetType);

    if (!normalizedType) {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetType. Must be "destination", "guide", or "hotel".'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetId format.'
      });
    }

    const targetEntity = await findTargetEntity(normalizedType, targetId);
    if (!targetEntity) {
      return res.status(404).json({
        success: false,
        error: `${targetLabel(normalizedType)} not found.`
      });
    }

    const stats = await recalculateTargetRating(normalizedType, targetId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get platform-wide rating statistics & popular summary
// @route   GET /api/reviews/ratings/summary
// @access  Public
exports.getRatingsSummary = async (req, res) => {
  try {
    const summary = await getOverallRatingsSummary();
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get popular / top-rated / most-reviewed destinations, guides, or hotels
// @route   GET /api/reviews/popular/:targetType
// @access  Public
exports.getPopularByTargetType = async (req, res) => {
  try {
    const { targetType } = req.params;
    const normalizedType = normalizeTargetType(targetType);

    if (!normalizedType) {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetType. Must be "destination", "guide", or "hotel".'
      });
    }

    const result = await getPopularTargets(normalizedType, {
      limit: req.query.limit,
      minReviews: req.query.minReviews,
      sortBy: req.query.sortBy
    });

    res.status(200).json({
      success: true,
      count: result.items.length,
      meta: {
        targetType: result.targetType,
        rankingMethod: result.rankingMethod,
        minimumThresholdWeight: result.minimumThresholdWeight,
        globalMeanRating: result.globalMeanRating
      },
      highestRated: result.highestRated,
      mostReviewed: result.mostReviewed,
      data: result.items
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get authenticated user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      authorId: req.user.id,
      status: { $nin: ['removed', 'rejected'] }
    })
      .populate('authorId', 'name profileImage role')
      .select('-reports')
      .sort({ createdAt: -1 })
      .lean();

    const enrichedReviews = await Promise.all(reviews.map(enrichReviewWithTarget));

    res.status(200).json({
      success: true,
      count: enrichedReviews.length,
      data: enrichedReviews
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update an existing review (only review author)
// @route   PUT /api/reviews/:id
// @access  Private (tourist / author)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID.' });
    }

    const review = await Review.findById(id);
    if (!review || ['removed', 'rejected'].includes(review.status)) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    // Verify ownership
    if (review.authorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to edit this review.'
      });
    }

    if (review.status === 'hidden') {
      return res.status(403).json({
        success: false,
        error: 'This review is currently hidden by moderation and cannot be edited.'
      });
    }

    const { score, comment } = req.body;

    if (score !== undefined) {
      const numericScore = Number(score);
      if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating score must be a whole number between 1 and 5.'
        });
      }
      review.score = numericScore;
    }

    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Review comment must be at least 3 characters long.'
        });
      }
      if (comment.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Review comment cannot exceed 1000 characters.'
        });
      }
      review.comment = comment.trim();
    }

    await review.save();
    await review.populate('authorId', 'name profileImage role');

    const ratingStats = await recalculateTargetRating(review.targetType, review.targetId);

    res.status(200).json({
      success: true,
      data: review,
      ratingStats,
      stats: ratingStats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a review (author or admin)
// @route   DELETE /api/reviews/:id
// @route   DELETE /api/admin/reviews/:id
// @access  Private (author or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID.' });
    }

    const review = await Review.findById(id);
    if (!review || review.status === 'removed') {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    const isOwner = review.authorId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this review.'
      });
    }

    const { targetType, targetId } = review;

    if (isAdmin || (review.reports && review.reports.length > 0)) {
      review.status = 'removed';
      review.moderatedBy = req.user.id;
      review.moderatedAt = Date.now();
      review.moderationHistory.push({
        adminId: req.user.id,
        action: 'remove',
        note: isAdmin ? 'Removed by administrator' : 'Removed by author after report'
      });
      await review.save();
    } else {
      await Review.findByIdAndDelete(id);
    }

    const ratingStats = await recalculateTargetRating(targetType, targetId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
      data: {},
      ratingStats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Report an inappropriate review
// @route   POST /api/reviews/:id/report
// @access  Private (any authenticated user)
exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID.' });
    }

    const allowedReasons = [
      'spam',
      'offensive',
      'fake',
      'misleading',
      'irrelevant',
      'inappropriate',
      'abusive',
      'other'
    ];
    const normalizedReason = reason ? reason.toString().trim().toLowerCase() : '';
    if (!allowedReasons.includes(normalizedReason)) {
      return res.status(400).json({
        success: false,
        error: `Invalid report reason. Must be one of: ${allowedReasons.join(', ')}.`
      });
    }

    const review = await Review.findById(id);
    if (!review || ['removed', 'rejected'].includes(review.status)) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    // Prevent reporting own review
    if (review.authorId.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot report your own review.'
      });
    }

    // Prevent duplicate reports from the same user
    const alreadyReported = review.reports.some(
      (rep) => rep.reportedBy.toString() === req.user.id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        error: 'You have already reported this review. Our moderation team will review it.'
      });
    }

    review.reports.push({
      reportedBy: req.user.id,
      reason: normalizedReason,
      details: details ? details.toString().trim().slice(0, 500) : '',
      status: 'pending'
    });
    review.isReported = true;

    // Note: Do NOT automatically hide or remove a review merely because someone reported it
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully for administrator moderation.',
      data: {
        reviewId: review._id,
        isReported: review.isReported,
        reportCount: review.reports.length
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all reports across reviews (Admin)
// @route   GET /api/reports
// @route   GET /api/reviews/admin/reports
// @access  Private (admin only)
exports.getAllReports = async (req, res) => {
  try {
    const statusFilter = req.query.status; // 'pending', 'reviewed', 'dismissed'
    const reviewsWithReports = await Review.find({ 'reports.0': { $exists: true } })
      .populate('authorId', 'name email role')
      .populate('reports.reportedBy', 'name email role')
      .sort({ updatedAt: -1 })
      .lean();

    const enrichedReviews = await Promise.all(reviewsWithReports.map(enrichReviewWithTarget));

    const flattenedReports = [];
    for (const rev of enrichedReviews) {
      for (const rep of rev.reports || []) {
        if (statusFilter && statusFilter !== 'all' && rep.status !== statusFilter) {
          continue;
        }
        flattenedReports.push({
          _id: rep._id,
          reportId: rep._id,
          reviewId: rev._id,
          reviewComment: rev.comment,
          reviewScore: rev.score,
          reviewStatus: rev.status,
          reviewAuthor: rev.authorId,
          targetType: rev.targetType,
          targetId: rev.targetId,
          targetName: rev.targetName,
          reportedBy: rep.reportedBy,
          reason: rep.reason,
          details: rep.details,
          status: rep.status,
          createdAt: rep.createdAt
        });
      }
    }

    res.status(200).json({
      success: true,
      count: flattenedReports.length,
      data: flattenedReports
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a specific report's status (Admin)
// @route   PUT /api/reports/:id/status
// @route   PUT /api/reviews/admin/reports/:id/status
// @access  Private (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['pending', 'reviewed', 'dismissed'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid report status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const review = await Review.findOne({ 'reports._id': id });
    if (!review) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    const reportSubdoc = review.reports.id(id);
    reportSubdoc.status = status;

    // Update review.isReported based on whether any pending reports remain
    review.isReported = review.reports.some((r) => r.status === 'pending');
    await review.save();

    res.status(200).json({
      success: true,
      message: `Report status updated to "${status}".`,
      data: {
        reportId: reportSubdoc._id,
        reviewId: review._id,
        status: reportSubdoc.status,
        isReported: review.isReported
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get reviews for administrator moderation (supports all reviews or reported/flagged only)
// @route   GET /api/admin/reviews
// @route   GET /api/reviews/admin/all
// @route   GET /api/reviews/admin/reported
// @access  Private (admin only)
exports.getReportedReviews = async (req, res) => {
  try {
    const { status, targetType, search, viewMode } = req.query;
    const isAllMode =
      viewMode === 'all' ||
      req.originalUrl.includes('/admin/all') ||
      req.originalUrl.startsWith('/api/admin/reviews');

    const query = {};

    if (!isAllMode && viewMode !== 'all') {
      query.$or = [
        { isReported: true },
        { 'reports.0': { $exists: true } },
        { status: { $in: ['hidden', 'removed', 'rejected'] } }
      ];
    }

    if (status && status !== 'all') {
      if (status === 'published' || status === 'active') {
        query.status = { $in: ['active', 'published'] };
      } else if (status === 'rejected' || status === 'removed') {
        query.status = { $in: ['removed', 'rejected'] };
      } else {
        query.status = status;
      }
    }

    if (targetType && targetType !== 'all') {
      const normalized = normalizeTargetType(targetType);
      if (normalized) query.targetType = normalized;
    }

    if (req.query.reportedOnly === 'true') {
      query.isReported = true;
    }

    const reviews = await Review.find(query)
      .populate('authorId', 'name email role profileImage')
      .populate('reports.reportedBy', 'name email role')
      .populate('moderatedBy', 'name email')
      .populate('moderationHistory.adminId', 'name email')
      .sort({ isReported: -1, updatedAt: -1 })
      .lean();

    let enriched = await Promise.all(
      reviews.map(async (rev) => {
        const withTarget = await enrichReviewWithTarget(rev);
        return {
          ...withTarget,
          pendingReportsCount: (rev.reports || []).filter((r) => r.status === 'pending').length
        };
      })
    );

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      enriched = enriched.filter(
        (r) =>
          (r.comment || '').toLowerCase().includes(q) ||
          (r.targetName || '').toLowerCase().includes(q) ||
          (r.authorId?.name || '').toLowerCase().includes(q) ||
          (r.authorId?.email || '').toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Moderate a review (hide, restore/approve, remove/reject, dismiss_reports)
// @route   PATCH /api/reviews/admin/:id/moderate
// @route   PUT /api/admin/reviews/:id/moderate
// @access  Private (admin only)
exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID.' });
    }

    const allowedActions = [
      'hide',
      'restore',
      'approve',
      'remove',
      'reject',
      'dismiss_reports'
    ];
    if (!action || !allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid moderation action. Allowed actions: ${allowedActions.join(', ')}.`
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    // Note: Moderation NEVER alters review.score
    if (action === 'hide') {
      review.status = 'hidden';
      review.reports.forEach((rep) => {
        if (rep.status === 'pending') rep.status = 'reviewed';
      });
    } else if (action === 'restore' || action === 'approve') {
      review.status = 'active';
      review.isReported = false;
      review.reports.forEach((rep) => {
        if (rep.status === 'pending') rep.status = 'dismissed';
      });
    } else if (action === 'remove' || action === 'reject') {
      review.status = action === 'reject' ? 'rejected' : 'removed';
      review.reports.forEach((rep) => {
        if (rep.status === 'pending') rep.status = 'reviewed';
      });
    } else if (action === 'dismiss_reports') {
      review.isReported = false;
      review.reports.forEach((rep) => {
        rep.status = 'dismissed';
      });
    }

    review.moderationNote = note ? note.toString().trim().slice(0, 500) : review.moderationNote;
    review.moderatedBy = req.user.id;
    review.moderatedAt = Date.now();
    review.moderationHistory.push({
      adminId: req.user.id,
      action,
      note: note ? note.toString().trim().slice(0, 500) : `Action: ${action}`
    });

    await review.save();
    await review.populate('authorId', 'name email role');
    await review.populate('moderatedBy', 'name email');
    await review.populate('moderationHistory.adminId', 'name email');

    // Recalculate target ratings since hidden/removed/rejected reviews are excluded from public averages
    const ratingStats = await recalculateTargetRating(review.targetType, review.targetId);

    res.status(200).json({
      success: true,
      message: `Review moderation action "${action}" applied successfully.`,
      data: review,
      ratingStats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
