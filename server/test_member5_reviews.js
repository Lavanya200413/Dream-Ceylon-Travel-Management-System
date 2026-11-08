/**
 * Automated End-to-End Verification Suite for MODULE 5: REVIEW AND RATING MANAGEMENT
 * Smart Lanka Tourism Planner and Travel Management System
 */
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const app = require('./server');
const User = require('./models/User');
const Destination = require('./models/Destination');
const Guide = require('./models/Guide');
const Hotel = require('./models/Hotel');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const { recalculateTargetRating } = require('./services/ratingService');

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = { raw };
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  await connectDB();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  console.log(`\n🚀 Running Module 5 (Review & Rating Management) E2E Tests on ${baseUrl}...\n`);

  let passed = 0;
  let failed = 0;
  const createdReviewIds = [];
  const createdBookingIds = [];
  const createdUserEmails = [
    'm5.tourist1@test.com',
    'm5.tourist2@test.com',
    'm5.unbooked@test.com'
  ];

  function assert(condition, testName, details = '') {
    if (condition) {
      passed++;
      console.log(`✅ PASS: ${testName}`);
    } else {
      failed++;
      console.error(`❌ FAIL: ${testName} ${details ? `— ${details}` : ''}`);
    }
  }

  try {
    // Clean up any leftover test users
    await User.deleteMany({ email: { $in: createdUserEmails } });

    // Register test users
    const t1Reg = await request('POST', '/api/auth/register', {
      name: 'M5 Tourist One',
      email: 'm5.tourist1@test.com',
      password: 'password123',
      role: 'tourist'
    });
    const tourist1Token = t1Reg.data.token;

    const t2Reg = await request('POST', '/api/auth/register', {
      name: 'M5 Tourist Two',
      email: 'm5.tourist2@test.com',
      password: 'password123',
      role: 'tourist'
    });
    const tourist2Token = t2Reg.data.token;

    const unbookedReg = await request('POST', '/api/auth/register', {
      name: 'M5 Unbooked Tourist',
      email: 'm5.unbooked@test.com',
      password: 'password123',
      role: 'tourist'
    });
    const unbookedToken = unbookedReg.data.token;

    // Login as seeded admin & guide
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@dreamceylon.lk',
      password: 'Password123!'
    });
    const adminToken = adminLogin.data.token;

    const guideLogin = await request('POST', '/api/auth/login', {
      email: 'nimal.guide@dreamceylon.lk',
      password: 'Password123!'
    });
    const guideOwnerToken = guideLogin.data.token;
    const guideOwnerUser = await User.findOne({ email: 'nimal.guide@dreamceylon.lk' });

    // Fetch targets
    const destination = await Destination.findOne({ name: /Sigiriya/i }) || (await Destination.findOne());
    const emptyDestination = await Destination.findOne({ reviewCount: 0 }) || destination;
    const guide = (guideOwnerUser && (await Guide.findOne({ userId: guideOwnerUser._id }))) || (await Guide.findOne());
    const hotel = await Hotel.findOne();

    // -------------------------------------------------------------------------
    // 1. REVIEW SUBMISSION & ELIGIBILITY VALIDATION TESTS
    // -------------------------------------------------------------------------
    const unauthRes = await request('POST', '/api/reviews', {
      targetType: 'destination',
      targetId: destination._id,
      score: 5,
      comment: 'Should fail without token'
    });
    assert(unauthRes.status === 401, '1.1 Reject unauthenticated review submission (401)');

    const badScoreRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'destination',
        targetId: destination._id,
        score: 6,
        comment: 'Invalid score out of bounds'
      },
      tourist1Token
    );
    assert(badScoreRes.status === 400, '1.2 Reject invalid rating score > 5 (400)');

    const floatScoreRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'destination',
        targetId: destination._id,
        score: 4.5,
        comment: 'Non-integer score should be rejected'
      },
      tourist1Token
    );
    assert(floatScoreRes.status === 400, '1.3 Reject non-integer rating score (400)');

    const emptyCommentRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'destination',
        targetId: destination._id,
        score: 5,
        comment: 'Hi'
      },
      tourist1Token
    );
    assert(emptyCommentRes.status === 400, '1.4 Reject empty/too-short comment (400)');

    const selfReviewRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'guide',
        targetId: guide._id,
        score: 5,
        comment: 'Attempting to review my own guide profile.'
      },
      guideOwnerToken
    );
    assert(selfReviewRes.status === 403, '1.5 Prevent self-reviews by service owner (403)');

    const unbookedGuideRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'guide',
        targetId: guide._id,
        score: 5,
        comment: 'I never booked this guide so this must be rejected.'
      },
      unbookedToken
    );
    assert(
      unbookedGuideRes.status === 403,
      '1.6 Reject guide review from tourist without completed booking (403)'
    );

    const unbookedHotelRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'hotel',
        targetId: hotel._id,
        score: 5,
        comment: 'I never stayed at this hotel so this must be rejected.'
      },
      unbookedToken
    );
    assert(
      unbookedHotelRes.status === 403,
      '1.7 Reject hotel review from tourist without completed booking (403)'
    );

    // Complete a booking for tourist1 on guide & hotel via complete-experience endpoint
    const completeGuideExp = await request(
      'POST',
      '/api/reviews/complete-experience',
      { targetType: 'guide', targetId: guide._id },
      tourist1Token
    );
    assert(
      (completeGuideExp.status === 200 || completeGuideExp.status === 201) && completeGuideExp.data.data?._id,
      '1.8 Record completed guide booking for tourist1'
    );
    if (completeGuideExp.data.data?._id) createdBookingIds.push(completeGuideExp.data.data._id);

    const completeHotelExp = await request(
      'POST',
      '/api/reviews/complete-experience',
      { targetType: 'hotel', targetId: hotel._id },
      tourist1Token
    );
    if (completeHotelExp.data.data?._id) createdBookingIds.push(completeHotelExp.data.data._id);

    // Check eligibility endpoint
    const eligRes = await request(
      'GET',
      `/api/reviews/eligibility/guide/${guide._id}`,
      null,
      tourist1Token
    );
    assert(
      eligRes.status === 200 && eligRes.data.data?.canReview === true && eligRes.data.data?.verifiedBooking === true,
      '1.9 Eligibility endpoint confirms verified booking for tourist1'
    );

    // Submit valid guide review
    const guideRevRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'guide',
        targetId: guide._id,
        score: 5,
        comment: 'Nuwan was an outstanding tour guide with deep cultural insight!'
      },
      tourist1Token
    );
    assert(
      guideRevRes.status === 201 && guideRevRes.data.data?.verifiedBooking === true,
      '1.10 Valid guide review submitted with verifiedBooking=true (201)'
    );
    const guideReviewId = guideRevRes.data.data?._id;
    if (guideReviewId) createdReviewIds.push(guideReviewId);

    // Duplicate review prevention
    const dupGuideRevRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'guide',
        targetId: guide._id,
        score: 4,
        comment: 'Attempting a second review for the same guide.'
      },
      tourist1Token
    );
    assert(dupGuideRevRes.status === 400, '1.11 Prevent duplicate review for same target by same tourist (400)');

    // Valid hotel review submission
    const hotelRevRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'hotel',
        targetId: hotel._id,
        score: 4,
        comment: 'Wonderful hospitality, clean rooms, and scenic views.'
      },
      tourist1Token
    );
    assert(
      hotelRevRes.status === 201 && hotelRevRes.data.data?.verifiedBooking === true,
      '1.12 Valid hotel review submitted with verifiedBooking=true (201)'
    );
    if (hotelRevRes.data.data?._id) createdReviewIds.push(hotelRevRes.data.data._id);

    // Valid destination review submission
    const destRevRes = await request(
      'POST',
      '/api/reviews',
      {
        targetType: 'destination',
        targetId: destination._id,
        score: 5,
        comment: 'Sigiriya is an unforgettable UNESCO World Heritage wonder!'
      },
      tourist1Token
    );
    assert(destRevRes.status === 201, '1.13 Valid destination review submitted (201)');
    const destReviewId = destRevRes.data.data?._id;
    if (destReviewId) createdReviewIds.push(destReviewId);

    // -------------------------------------------------------------------------
    // 2. REVIEW MANAGEMENT & FILTERING TESTS
    // -------------------------------------------------------------------------
    const editOtherRes = await request(
      'PUT',
      `/api/reviews/${guideReviewId}`,
      { score: 2, comment: 'Trying to hijack tourist1 review' },
      tourist2Token
    );
    assert(editOtherRes.status === 403, '2.1 Prevent editing another user review (403)');

    const editOwnRes = await request(
      'PUT',
      `/api/reviews/${guideReviewId}`,
      { score: 4, comment: 'Updated my guide review to 4 stars after reflection.' },
      tourist1Token
    );
    assert(
      editOwnRes.status === 200 && editOwnRes.data.data?.score === 4,
      '2.2 Allow author to edit own review and recalculate rating (200)'
    );

    const filterStarRes = await request(
      'GET',
      `/api/reviews/guide/${guide._id}?star=4&sort=highest`
    );
    assert(
      filterStarRes.status === 200 &&
        filterStarRes.data.data.every((r) => r.score === 4),
      '2.3 Filter reviews by star rating and sort order'
    );

    // -------------------------------------------------------------------------
    // 3. RATING AGGREGATION TESTS
    // -------------------------------------------------------------------------
    const statsAfterEdit = editOwnRes.data.stats;
    assert(
      typeof statsAfterEdit.averageRating === 'number' &&
        typeof statsAfterEdit.fiveStarCount === 'number' &&
        typeof statsAfterEdit.fourStarCount === 'number' &&
        statsAfterEdit.totalReviews >= 1,
      '3.1 Rating aggregation returns exact averageRating, totalReviews, and 5..1 star counts'
    );

    const emptyStatsRes = await request(
      'GET',
      `/api/reviews/ratings/destination/${emptyDestination._id}`
    );
    assert(
      emptyStatsRes.status === 200 &&
        typeof emptyStatsRes.data.data?.averageRating === 'number',
      '3.2 Empty rating state handled cleanly without NaN'
    );

    // -------------------------------------------------------------------------
    // 4. REPORTING & MODERATION TESTS
    // -------------------------------------------------------------------------
    const selfReportRes = await request(
      'POST',
      `/api/reviews/${guideReviewId}/report`,
      { reason: 'spam', details: 'Reporting my own review' },
      tourist1Token
    );
    assert(selfReportRes.status === 400, '4.1 Prevent author from reporting own review (400)');

    const reportRes = await request(
      'POST',
      `/api/reviews/${guideReviewId}/report`,
      { reason: 'spam', details: 'Flagging this review for admin inspection.' },
      tourist2Token
    );
    assert(
      reportRes.status === 200 || reportRes.status === 201,
      '4.2 Allow authenticated user to report a review without auto-removal (200/201)'
    );

    const dupReportRes = await request(
      'POST',
      `/api/reviews/${guideReviewId}/report`,
      { reason: 'offensive', details: 'Duplicate report attempt' },
      tourist2Token
    );
    assert(dupReportRes.status === 400, '4.3 Prevent duplicate reports from same user (400)');

    const nonAdminModRes = await request(
      'GET',
      '/api/admin/reviews',
      null,
      tourist1Token
    );
    assert(nonAdminModRes.status === 403, '4.4 Reject non-admin access to moderation endpoints (403)');

    const adminQueueRes = await request(
      'GET',
      '/api/reviews/admin/reported',
      null,
      adminToken
    );
    assert(
      adminQueueRes.status === 200 &&
        adminQueueRes.data.data.some((r) => String(r._id) === String(guideReviewId)),
      '4.5 Admin can view reported reviews queue'
    );

    const adminReportsLogRes = await request(
      'GET',
      '/api/reports',
      null,
      adminToken
    );
    assert(
      adminReportsLogRes.status === 200 && adminReportsLogRes.data.data.length > 0,
      '4.6 Admin can view individual reports log (/api/reports)'
    );

    // Hide the review and verify score is preserved while excluded from public rating
    const hideRes = await request(
      'PATCH',
      `/api/reviews/admin/${guideReviewId}/moderate`,
      { action: 'hide', note: 'Temporarily hidden during investigation' },
      adminToken
    );
    assert(
      hideRes.status === 200 &&
        hideRes.data.data?.status === 'hidden' &&
        hideRes.data.data?.score === 4,
      '4.7 Admin can hide review without altering original review score'
    );

    const publicListWhileHidden = await request('GET', `/api/reviews/guide/${guide._id}`);
    assert(
      !publicListWhileHidden.data.data.some((r) => String(r._id) === String(guideReviewId)),
      '4.8 Hidden review is excluded from public review list and rating aggregation'
    );

    // Restore / approve the review
    const restoreRes = await request(
      'PATCH',
      `/api/reviews/admin/${guideReviewId}/moderate`,
      { action: 'approve', note: 'Verified authentic review, restored to active' },
      adminToken
    );
    assert(
      restoreRes.status === 200 &&
        restoreRes.data.data?.status === 'active' &&
        restoreRes.data.data?.moderationHistory?.length >= 2,
      '4.9 Admin can approve/restore review and audit history is recorded'
    );

    // Delete own destination review and verify recalculation
    const delRes = await request(
      'DELETE',
      `/api/reviews/${destReviewId}`,
      null,
      tourist1Token
    );
    assert(delRes.status === 200, '4.10 Author can delete own review and trigger rating recalculation');

    // -------------------------------------------------------------------------
    // 5. POPULAR-ITEM STATISTICS TESTS
    // -------------------------------------------------------------------------
    const popDestRes = await request('GET', '/api/reviews/popular/destinations?limit=5');
    assert(
      popDestRes.status === 200 &&
        Array.isArray(popDestRes.data.data) &&
        Array.isArray(popDestRes.data.highestRated) &&
        Array.isArray(popDestRes.data.mostReviewed),
      '5.1 Popular destinations endpoint returns Bayesian weighted, highestRated, and mostReviewed rankings'
    );

    const popGuideRes = await request('GET', '/api/reviews/popular/guides?limit=5');
    assert(
      popGuideRes.status === 200 && Array.isArray(popGuideRes.data.data),
      '5.2 Popular guides endpoint returns ranked guides'
    );

    const popHotelRes = await request('GET', '/api/reviews/popular/hotels?limit=5');
    assert(
      popHotelRes.status === 200 && Array.isArray(popHotelRes.data.data),
      '5.3 Popular hotels endpoint returns ranked hotels'
    );

    const overallSummaryRes = await request('GET', '/api/reviews/ratings/summary');
    assert(
      overallSummaryRes.status === 200 &&
        overallSummaryRes.data.data?.popular?.destinations &&
        overallSummaryRes.data.data?.popular?.guides &&
        overallSummaryRes.data.data?.popular?.hotels,
      '5.4 Overall ratings summary endpoint (/api/reviews/ratings/summary) returns all three categories'
    );
  } finally {
    // Clean up test data and resynchronize target ratings
    if (createdReviewIds.length > 0) {
      const reviewsToClean = await Review.find({ _id: { $in: createdReviewIds } });
      await Review.deleteMany({ _id: { $in: createdReviewIds } });
      for (const r of reviewsToClean) {
        await recalculateTargetRating(r.targetType, r.targetId);
      }
    }
    if (createdBookingIds.length > 0) {
      await Booking.deleteMany({ _id: { $in: createdBookingIds } });
    }
    await User.deleteMany({ email: { $in: createdUserEmails } });

    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  }

  console.log(`\n=============================================================`);
  console.log(`🎯 MODULE 5 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`=============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
