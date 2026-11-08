const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Destination = require('./models/Destination');
const Guide = require('./models/Guide');
const Hotel = require('./models/Hotel');
const Booking = require('./models/Booking');
const TourPlan = require('./models/TourPlan');
const Review = require('./models/Review');
const { recalculateTargetRating } = require('./services/ratingService');

dotenv.config();
connectDB();

const ensureUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      passwordHash: password,
      role
    });
  }
  return user;
};

const seedServicesAndReviews = async () => {
  try {
    // 1. Ensure Demo Accounts exist (non-destructive)
    await ensureUser({
      name: 'System Administrator',
      email: 'admin@dreamceylon.lk',
      password: 'Password123!',
      role: 'admin'
    });

    const tourist1 = await ensureUser({
      name: 'Kasun Perera',
      email: 'kasun.tourist@dreamceylon.lk',
      password: 'Password123!',
      role: 'tourist'
    });

    const tourist2 = await ensureUser({
      name: 'Emma Richardson',
      email: 'emma.tourist@dreamceylon.lk',
      password: 'Password123!',
      role: 'tourist'
    });

    const tourist3 = await ensureUser({
      name: 'Liam OConnor',
      email: 'liam.tourist@dreamceylon.lk',
      password: 'Password123!',
      role: 'tourist'
    });

    const guideUser1 = await ensureUser({
      name: 'Nimal Bandara',
      email: 'nimal.guide@dreamceylon.lk',
      password: 'Password123!',
      role: 'guide'
    });

    const guideUser2 = await ensureUser({
      name: 'Chaminda Silva',
      email: 'chaminda.guide@dreamceylon.lk',
      password: 'Password123!',
      role: 'guide'
    });

    const guideUser3 = await ensureUser({
      name: 'Priyantha Fernando',
      email: 'priyantha.guide@dreamceylon.lk',
      password: 'Password123!',
      role: 'guide'
    });

    const hotelOwner1 = await ensureUser({
      name: 'Ceylon Heritage Hospitality',
      email: 'hotels@dreamceylon.lk',
      password: 'Password123!',
      role: 'hotel_owner'
    });

    // Clean up any leftover automated test guide/hotel records with numeric timestamps
    await Guide.deleteMany({ name: /Test Guide [AB] \d+/i });
    await Hotel.deleteMany({ name: /(Grand Kandy Heritage Hotel|Galle Beach Villa) \d+/i });

    // 2. Seed or synchronize Guides with verified USD rates & imagery
    const defaultGuides = [
      {
        userId: guideUser1._id,
        name: 'Nimal Bandara',
        phone: '+94 77 234 5678',
        bio: 'National Cultural & UNESCO Heritage Historian with 12+ years guiding across the Cultural Triangle and Kandy.',
        serviceAreas: ['Kandy', 'Sigiriya', 'Anuradhapura', 'Polonnaruwa'],
        languages: ['English', 'German', 'Sinhala'],
        dailyRate: 55,
        availability: true,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
      },
      {
        userId: guideUser2._id,
        name: 'Chaminda Silva',
        phone: '+94 71 876 5432',
        bio: 'Certified Wildlife Tracker & Hill Country Trekking Specialist covering Yala, Ella, and Horton Plains.',
        serviceAreas: ['Yala', 'Ella', 'Nuwara Eliya', 'Mirissa'],
        languages: ['English', 'French', 'Sinhala'],
        dailyRate: 60,
        availability: true,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      },
      {
        userId: guideUser3._id,
        name: 'Priyantha Fernando',
        phone: '+94 76 543 2109',
        bio: 'Southern Coast, Galle Fort Architecture & Culinary Tour Specialist with comfortable chauffeur expertise.',
        serviceAreas: ['Galle', 'Mirissa', 'Bentota', 'Colombo'],
        languages: ['English', 'Spanish', 'Sinhala'],
        dailyRate: 45,
        availability: true,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
      }
    ];

    for (const gData of defaultGuides) {
      await Guide.findOneAndUpdate(
        { name: gData.name },
        { $set: gData },
        { upsert: true, new: true }
      );
    }
    // Also normalize any other existing guide whose dailyRate was stored in LKR (> 1000)
    await Guide.updateMany({ dailyRate: { $gt: 1000 } }, { $set: { dailyRate: 55 } });
    let guides = await Guide.find();

    // 3. Seed or synchronize Hotels with verified USD rates & imagery
    const defaultHotels = [
      {
        ownerId: hotelOwner1._id,
        name: 'Cinnamon Citadel Kandy Resort',
        location: 'Kandy',
        phone: '+94 81 223 4365',
        description: 'Tranquil riverside 4-star resort surrounded by misty hills and Mahaweli River views.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        rooms: [
          { type: 'Superior River View', capacity: 2, count: 15, price: 145 },
          { type: 'Deluxe Family Suite', capacity: 4, count: 6, price: 210 }
        ],
        facilities: ['Infinity Pool', 'Free Wi-Fi', 'Ayurvedic Spa', 'Riverside Dining'],
        pricePerNight: 145,
        availability: true
      },
      {
        ownerId: hotelOwner1._id,
        name: '98 Acres Mountain Eco Resort',
        location: 'Ella',
        phone: '+94 57 205 0050',
        description: 'Luxury boutique eco-chalets nestled in a scenic tea estate overlooking Little Adam’s Peak.',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
        rooms: [
          { type: 'Deluxe Tea Chalet', capacity: 2, count: 10, price: 210 },
          { type: 'Grand Mountain Villa', capacity: 3, count: 4, price: 290 }
        ],
        facilities: ['Mountain View Deck', 'Organic Restaurant', 'Free Wi-Fi', 'Tea Tour'],
        pricePerNight: 210,
        availability: true
      },
      {
        ownerId: hotelOwner1._id,
        name: 'Galle Fort Heritage Boutique Hotel',
        location: 'Galle',
        phone: '+94 91 224 3890',
        description: 'Restored 18th-century Dutch colonial mansion inside the UNESCO Galle Fort ramparts.',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
        rooms: [
          { type: 'Colonial Courtyard Suite', capacity: 2, count: 8, price: 165 }
        ],
        facilities: ['Courtyard Pool', 'Free Wi-Fi', 'Heritage Library', 'Seafood Bistro'],
        pricePerNight: 165,
        availability: true
      },
      {
        ownerId: hotelOwner1._id,
        name: 'Sigiriya Jungle Eco Lodge',
        location: 'Sigiriya',
        phone: '+94 66 228 6123',
        description: 'Nature-immersive eco-lodge with direct views of the iconic Sigiriya Lion Rock Fortress.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
        rooms: [
          { type: 'Garden Eco Cabin', capacity: 2, count: 12, price: 95 }
        ],
        facilities: ['Birdwatching Trails', 'Outdoor Pool', 'Village Curry Dining'],
        pricePerNight: 95,
        availability: true
      }
    ];

    for (const hData of defaultHotels) {
      await Hotel.findOneAndUpdate(
        { name: hData.name },
        { $set: hData },
        { upsert: true, new: true }
      );
    }
    await Hotel.updateMany({ pricePerNight: { $gt: 1000 } }, { $set: { pricePerNight: 125 } });
    let hotels = await Hotel.find();

    // 4. Seed Sample Completed Bookings & Guide/Hotel Reviews if no reviews exist yet
    const existingReviewsCount = await Review.countDocuments({
      targetType: { $in: ['guide', 'hotel'] }
    });
    if (existingReviewsCount === 0 && guides.length >= 2 && hotels.length >= 2) {
      const booking1 = await Booking.create({
        touristId: tourist1._id,
        guideId: guides[0]._id,
        hotelId: hotels[0]._id,
        status: 'Completed',
        totalAmount: 450
      });

      const booking2 = await Booking.create({
        touristId: tourist2._id,
        guideId: guides[0]._id,
        hotelId: hotels[1]._id,
        status: 'Completed',
        totalAmount: 680
      });

      const booking3 = await Booking.create({
        touristId: tourist3._id,
        guideId: guides[1]._id,
        hotelId: hotels[1]._id,
        status: 'Completed',
        totalAmount: 590
      });

      await Review.insertMany([
        {
          authorId: tourist1._id,
          targetType: 'guide',
          targetId: guides[0]._id,
          score: 5,
          comment: 'Nimal was an extraordinary historian! He explained the ancient frescoes and hydraulic engineering of Sigiriya and Polonnaruwa with remarkable depth.',
          verifiedBooking: true,
          bookingId: booking1._id,
          status: 'active'
        },
        {
          authorId: tourist2._id,
          targetType: 'guide',
          targetId: guides[0]._id,
          score: 5,
          comment: 'Very punctual, fluent in both English and German, and customized our Kandy Temple visit to avoid peak crowds. Highly recommended!',
          verifiedBooking: true,
          bookingId: booking2._id,
          status: 'active'
        },
        {
          authorId: tourist3._id,
          targetType: 'guide',
          targetId: guides[1]._id,
          score: 4,
          comment: 'Chaminda spotted two leopards in Yala within the first hour and guided us safely up Ella Rock. Great wildlife knowledge.',
          verifiedBooking: true,
          bookingId: booking3._id,
          status: 'active'
        },
        {
          authorId: tourist1._id,
          targetType: 'hotel',
          targetId: hotels[0]._id,
          score: 5,
          comment: 'Beautiful riverside location in Kandy. The Sri Lankan breakfast buffet and hospitality were top-notch.',
          verifiedBooking: true,
          bookingId: booking1._id,
          status: 'active'
        },
        {
          authorId: tourist2._id,
          targetType: 'hotel',
          targetId: hotels[1]._id,
          score: 5,
          comment: 'Waking up to the mist over Little Adams Peak from our tea chalet was unforgettable. Worth every penny!',
          verifiedBooking: true,
          bookingId: booking2._id,
          status: 'active'
        },
        {
          authorId: tourist3._id,
          targetType: 'hotel',
          targetId: hotels[1]._id,
          score: 4,
          comment: 'Stunning views and eco-friendly architecture. A bit of a climb to the upper chalets, but the staff helped with luggage promptly.',
          verifiedBooking: true,
          bookingId: booking3._id,
          status: 'active',
          isReported: true,
          reports: [
            {
              reportedBy: tourist1._id,
              reason: 'irrelevant',
              details: 'Sample flagged review for testing the Admin Moderation queue.',
              status: 'pending'
            }
          ]
        }
      ]);
      console.log('Seeded sample verified guide and hotel reviews.');
    }

    // 5. Seed Sample Destination Reviews if none exist yet
    const existingDestReviews = await Review.countDocuments({ targetType: 'destination' });
    const destinations = await Destination.find().limit(4);
    if (existingDestReviews === 0 && destinations.length >= 2) {
      const tourPlan = await TourPlan.create({
        touristId: tourist1._id,
        days: 5,
        stops: destinations.map((d) => d._id),
        dates: {
          start: new Date('2026-01-10'),
          end: new Date('2026-01-15')
        },
        transportType: 'Car'
      });

      const destBooking = await Booking.create({
        touristId: tourist1._id,
        tourPlanId: tourPlan._id,
        guideId: guides[0]?._id,
        hotelId: hotels[0]?._id,
        status: 'Completed',
        totalAmount: 720
      });

      const destReviewsPayload = [
        {
          authorId: tourist1._id,
          targetType: 'destination',
          targetId: destinations[0]._id,
          score: 5,
          comment: `Visiting ${destinations[0].name} at sunrise was the highlight of our Sri Lanka itinerary. Well-maintained pathways and breathtaking panoramic views!`,
          verifiedBooking: true,
          bookingId: destBooking._id,
          status: 'active'
        },
        {
          authorId: tourist2._id,
          targetType: 'destination',
          targetId: destinations[0]._id,
          score: 5,
          comment: `Truly world-class heritage and scenery at ${destinations[0].name}. Arrive before 7:30 AM for the coolest weather and best lighting.`,
          verifiedBooking: true,
          bookingId: destBooking._id,
          status: 'active'
        },
        {
          authorId: tourist3._id,
          targetType: 'destination',
          targetId: destinations[1]._id,
          score: 4,
          comment: `Wonderful atmosphere at ${destinations[1].name}. Great local food stalls nearby and friendly guides.`,
          verifiedBooking: false,
          status: 'active'
        }
      ];

      if (destinations[2]) {
        destReviewsPayload.push({
          authorId: tourist1._id,
          targetType: 'destination',
          targetId: destinations[2]._id,
          score: 5,
          comment: `Unforgettable experience exploring ${destinations[2].name}. Highly recommended for families and nature lovers.`,
          verifiedBooking: true,
          bookingId: destBooking._id,
          status: 'active'
        });
      }

      await Review.insertMany(destReviewsPayload);
      console.log('Seeded sample destination reviews.');
    }

    // 6. Synchronize ratings on all guides, hotels, and reviewed destinations
    for (const g of guides) {
      await recalculateTargetRating('guide', g._id);
    }
    for (const h of hotels) {
      await recalculateTargetRating('hotel', h._id);
    }
    for (const d of destinations) {
      await recalculateTargetRating('destination', d._id);
    }

    console.log('Module 5 Services, Destinations & Reviews Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err.message);
    process.exit(1);
  }
};

seedServicesAndReviews();
