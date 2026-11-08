const mongoose = require('mongoose');
const Review = require('../models/Review');
const Destination = require('../models/Destination');
const Guide = require('../models/Guide');
const Hotel = require('../models/Hotel');

const PUBLISHED_STATUSES = ['active', 'published'];

/**
 * Normalize targetType to lowercase ('destination', 'guide', or 'hotel')
 */
const normalizeTargetType = (targetType) => {
  if (!targetType || typeof targetType !== 'string') return null;
  const cleaned = targetType.trim().toLowerCase();
  if (cleaned === 'destination' || cleaned === 'destinations') return 'destination';
  if (cleaned === 'guide' || cleaned === 'guides') return 'guide';
  if (cleaned === 'hotel' || cleaned === 'hotels') return 'hotel';
  return null;
};

/**
 * Return the Mongoose model for a normalized targetType
 */
const getTargetModel = (normalizedType) => {
  if (normalizedType === 'destination') return Destination;
  if (normalizedType === 'guide') return Guide;
  if (normalizedType === 'hotel') return Hotel;
  return null;
};

/**
 * Calculate rating statistics (averageRating, totalReviews, distribution 1-5,
 * and explicit fiveStarCount..oneStarCount) for a given targetType and targetId
 * using MongoDB Aggregation.
 * Also synchronizes the target Destination, Guide, or Hotel document's rating and reviewCount fields.
 */
const recalculateTargetRating = async (targetType, targetId) => {
  const normalizedType = normalizeTargetType(targetType);
  if (!normalizedType || !mongoose.Types.ObjectId.isValid(targetId)) {
    throw new Error('Invalid targetType or targetId for rating aggregation');
  }

  const objectId = new mongoose.Types.ObjectId(targetId);

  const aggregation = await Review.aggregate([
    {
      $match: {
        targetType: normalizedType,
        targetId: objectId,
        status: { $in: PUBLISHED_STATUSES }
      }
    },
    {
      $group: {
        _id: '$targetId',
        sumScores: { $sum: '$score' },
        averageRating: { $avg: '$score' },
        totalReviews: { $sum: 1 },
        star1: { $sum: { $cond: [{ $eq: ['$score', 1] }, 1, 0] } },
        star2: { $sum: { $cond: [{ $eq: ['$score', 2] }, 1, 0] } },
        star3: { $sum: { $cond: [{ $eq: ['$score', 3] }, 1, 0] } },
        star4: { $sum: { $cond: [{ $eq: ['$score', 4] }, 1, 0] } },
        star5: { $sum: { $cond: [{ $eq: ['$score', 5] }, 1, 0] } }
      }
    }
  ]);

  const stats = {
    targetType: normalizedType,
    targetId: targetId.toString(),
    averageRating: 0,
    totalReviews: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  };

  if (aggregation.length > 0 && aggregation[0].totalReviews > 0) {
    const res = aggregation[0];
    // Average Rating = Sum of All Valid Rating Scores / Total Valid Reviews
    const exactAvg = res.sumScores / res.totalReviews;
    stats.averageRating = Number(exactAvg.toFixed(1));
    stats.totalReviews = res.totalReviews;
    stats.fiveStarCount = res.star5;
    stats.fourStarCount = res.star4;
    stats.threeStarCount = res.star3;
    stats.twoStarCount = res.star2;
    stats.oneStarCount = res.star1;
    stats.distribution = {
      1: res.star1,
      2: res.star2,
      3: res.star3,
      4: res.star4,
      5: res.star5
    };
  }

  // Synchronize rating and reviewCount on the target Destination, Guide, or Hotel document
  const TargetModel = getTargetModel(normalizedType);
  if (TargetModel) {
    await TargetModel.findByIdAndUpdate(objectId, {
      rating: stats.averageRating,
      reviewCount: stats.totalReviews
    });
  }

  return stats;
};

/**
 * Compute popular / highly-rated and most-reviewed items using Bayesian weighted average ranking:
 * weightedScore = (v / (v + m)) * R + (m / (v + m)) * C
 * where:
 *   R = item's average rating from published reviews
 *   v = item's number of published reviews
 *   m = minimum review threshold weight (default 2)
 *   C = global mean rating across published reviews for that targetType (or 4.0 fallback)
 *
 * This prevents a target with a single 5-star review from outranking a target with many positive reviews.
 */
const getPopularTargets = async (targetType, options = {}) => {
  const normalizedType = normalizeTargetType(targetType);
  if (!normalizedType) {
    throw new Error('Invalid target type. Must be destination, guide, or hotel.');
  }

  const limit = Math.max(1, Math.min(50, parseInt(options.limit, 10) || 6));
  const minReviews = Math.max(0, parseInt(options.minReviews, 10) || 0);
  const sortBy = options.sortBy || 'weighted'; // 'weighted' | 'highest_rated' | 'most_reviewed'
  const m = 2; // smoothing weight for Bayesian confidence

  // Calculate global average across all published reviews of this targetType
  const globalAgg = await Review.aggregate([
    { $match: { targetType: normalizedType, status: { $in: PUBLISHED_STATUSES } } },
    {
      $group: {
        _id: null,
        globalAvg: { $avg: '$score' },
        totalCount: { $sum: 1 }
      }
    }
  ]);

  const C = globalAgg.length > 0 && globalAgg[0].globalAvg ? globalAgg[0].globalAvg : 4.0;

  // Aggregate per-target published review stats
  const perTargetAgg = await Review.aggregate([
    { $match: { targetType: normalizedType, status: { $in: PUBLISHED_STATUSES } } },
    {
      $group: {
        _id: '$targetId',
        sumScores: { $sum: '$score' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const statsMap = new Map();
  perTargetAgg.forEach((item) => {
    const exactAvg = item.totalReviews > 0 ? item.sumScores / item.totalReviews : 0;
    statsMap.set(item._id.toString(), {
      averageRating: Number(exactAvg.toFixed(1)),
      totalReviews: item.totalReviews
    });
  });

  const TargetModel = getTargetModel(normalizedType);
  let query = TargetModel.find();
  if (normalizedType === 'guide') {
    query = query.populate({ path: 'userId', select: 'name email profileImage' });
  } else if (normalizedType === 'hotel') {
    query = query.populate({ path: 'ownerId', select: 'name email' });
  }

  const targets = await query.lean();

  const enrichedAll = targets
    .map((target) => {
      const liveStats = statsMap.get(target._id.toString());
      const R = liveStats ? liveStats.averageRating : 0;
      const v = liveStats ? liveStats.totalReviews : 0;

      // Only compute positive Bayesian weightedScore from actual published reviews
      const weightedScore =
        v > 0 ? Number((((v / (v + m)) * R) + ((m / (v + m)) * C)).toFixed(2)) : 0;

      return {
        ...target,
        rating: R,
        reviewCount: v,
        weightedScore
      };
    })
    .filter((item) => item.reviewCount >= minReviews);

  // Highest rated (Bayesian weighted score first so 1-review doesn't beat many 5-star reviews)
  const highestRated = [...enrichedAll]
    .sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore;
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return b.rating - a.rating;
    })
    .slice(0, limit);

  // Most reviewed (by reviewCount descending, tie-broken by weightedScore)
  const mostReviewed = [...enrichedAll]
    .sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore;
      return b.rating - a.rating;
    })
    .slice(0, limit);

  const items = sortBy === 'most_reviewed' ? mostReviewed : highestRated;

  return {
    targetType: normalizedType,
    rankingMethod: 'Bayesian Weighted Average: W = (v/(v+m))*R + (m/(v+m))*C',
    minimumThresholdWeight: m,
    globalMeanRating: Number(C.toFixed(2)),
    items,
    highestRated,
    mostReviewed
  };
};

/**
 * Overall platform rating & popularity summary across destinations, guides, and hotels
 */
const getOverallRatingsSummary = async () => {
  const [overallAgg, byTypeAgg, destPopular, guidePopular, hotelPopular] = await Promise.all([
    Review.aggregate([
      { $match: { status: { $in: PUBLISHED_STATUSES } } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$score' },
          star1: { $sum: { $cond: [{ $eq: ['$score', 1] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$score', 2] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$score', 3] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$score', 4] }, 1, 0] } },
          star5: { $sum: { $cond: [{ $eq: ['$score', 5] }, 1, 0] } }
        }
      }
    ]),
    Review.aggregate([
      { $match: { status: { $in: PUBLISHED_STATUSES } } },
      {
        $group: {
          _id: '$targetType',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$score' }
        }
      }
    ]),
    getPopularTargets('destination', { limit: 5, minReviews: 1 }),
    getPopularTargets('guide', { limit: 5, minReviews: 1 }),
    getPopularTargets('hotel', { limit: 5, minReviews: 1 })
  ]);

  const base = overallAgg[0] || {
    totalReviews: 0,
    averageRating: 0,
    star1: 0,
    star2: 0,
    star3: 0,
    star4: 0,
    star5: 0
  };

  const breakdownByType = {
    destination: { totalReviews: 0, averageRating: 0 },
    guide: { totalReviews: 0, averageRating: 0 },
    hotel: { totalReviews: 0, averageRating: 0 }
  };

  byTypeAgg.forEach((row) => {
    if (breakdownByType[row._id]) {
      breakdownByType[row._id] = {
        totalReviews: row.totalReviews,
        averageRating: Number((row.averageRating || 0).toFixed(1))
      };
    }
  });

  return {
    totalReviews: base.totalReviews,
    averageRating: base.totalReviews > 0 ? Number(base.averageRating.toFixed(1)) : 0,
    distribution: {
      1: base.star1,
      2: base.star2,
      3: base.star3,
      4: base.star4,
      5: base.star5
    },
    breakdownByType,
    popular: {
      destinations: {
        highestRated: destPopular.highestRated,
        mostReviewed: destPopular.mostReviewed
      },
      guides: {
        highestRated: guidePopular.highestRated,
        mostReviewed: guidePopular.mostReviewed
      },
      hotels: {
        highestRated: hotelPopular.highestRated,
        mostReviewed: hotelPopular.mostReviewed
      }
    }
  };
};

module.exports = {
  PUBLISHED_STATUSES,
  normalizeTargetType,
  recalculateTargetRating,
  getPopularTargets,
  getOverallRatingsSummary
};
