const mongoose = require('mongoose');
const Package = require('./models/Package');

async function updatePackages() {
  await mongoose.connect('mongodb://localhost:27017/dream-ceylon');

  await Package.updateOne({ packageName: 'Basic' }, {
    $set: {
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80',
      durationDays: 3,
      destinationsCovered: ['Colombo', 'Negombo', 'Kandy'],
      activities: ['Scenic Road Trip', 'Cultural Sightseeing', 'Independent Dining', 'Photo Stops'],
      gallery: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1588258524675-c6350f5888a7?w=800&auto=format&fit=crop&q=80'
      ],
      dayByDayItinerary: [
        { day: 1, title: 'Arrival & Colombo Gateway', description: 'Meet your dedicated chauffeur, explore Colombo ocean promenade and transit to historic suburbs.', activities: ['Airport pickup', 'Colombo city drive', 'Sunset at Galle Face'] },
        { day: 2, title: 'Road to Kandy Highlands', description: 'Scenic drive through rubber and spice plantations into Kandy valley.', activities: ['Pinnawala route visit', 'Spice garden walk', 'Kandy lake stroll'] },
        { day: 3, title: 'Temple of the Tooth & Return', description: 'Cultural visit to the Sacred Tooth Relic temple and return transfer.', activities: ['Temple exploration', 'Handicraft market', 'Airport/Colombo return'] }
      ]
    }
  });

  await Package.updateOne({ packageName: 'Standard' }, {
    $set: {
      image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1200&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1200&auto=format&fit=crop&q=80',
      durationDays: 5,
      destinationsCovered: ['Sigiriya', 'Dambulla', 'Kandy', 'Nuwara Eliya'],
      activities: ['Heritage Climbing', 'Cave Temple Tour', 'Tea Plantation Walk', '3-4 Star Handpicked Stays'],
      gallery: [
        'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80'
      ],
      dayByDayItinerary: [
        { day: 1, title: 'Cultural Triangle Gateway', description: 'Arrive in Sri Lanka and travel north to Sigiriya rock citadel.', activities: ['Chauffeur pickup', 'Check-in 3-4★ resort', 'Evening village walk'] },
        { day: 2, title: 'Sigiriya Rock Fortress & Dambulla', description: 'Early morning climb of Sigiriya Lion Rock followed by the ancient Dambulla cave murals.', activities: ['Sigiriya summit climb', 'Dambulla cave temple', 'Ayurvedic herbal tea stop'] },
        { day: 3, title: 'Kandy Royal Kingdom', description: 'Drive into Kandy, witness the Temple of the Tooth and traditional cultural dancing.', activities: ['Temple of the Tooth', 'Cultural dance show', 'Kandy viewpoint'] },
        { day: 4, title: 'Tea Country Nuwara Eliya', description: 'Ascend through cascading waterfalls and lush tea estates into Little England.', activities: ['Ramboda Falls', 'Tea factory tasting tour', 'Lake Gregory evening'] },
        { day: 5, title: 'Highland Panorama & Return', description: 'Scenic morning in Nuwara Eliya followed by transfer to Colombo/Airport.', activities: ['Botanical gardens walk', 'Scenic highway drive', 'Airport drop-off'] }
      ]
    }
  });

  await Package.updateOne({ packageName: 'Premium' }, {
    $set: {
      image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1200&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1200&auto=format&fit=crop&q=80',
      durationDays: 7,
      destinationsCovered: ['Sigiriya', 'Kandy', 'Ella', 'Yala National Park', 'Galle Fort'],
      activities: ['5-Star Luxury Resorts', 'Specialist National Guide', 'Yala Leopard Safari', 'All Gourmet Dining', 'Galle Fort Ramparts Walk'],
      gallery: [
        'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1588598198321-9735fd524a0b?w=800&auto=format&fit=crop&q=80'
      ],
      dayByDayItinerary: [
        { day: 1, title: 'VIP Arrival & Cultural Luxury', description: 'Private executive transfer to 5-star heritage villa in Sigiriya.', activities: ['VIP Chauffeur transfer', 'Welcome champagne dinner', 'Spa treatment'] },
        { day: 2, title: 'Sigiriya Rock & Ancient Wonders', description: 'Exclusive sunrise access to Sigiriya with your dedicated historian guide.', activities: ['Sigiriya sunrise climb', 'Private archaeology tour', 'Gourmet organic lunch'] },
        { day: 3, title: 'Kandy Royal Heritage', description: 'Private tour of Dalada Maligawa and exclusive botanical conservatory.', activities: ['Temple VIP access', 'Royal Botanical Gardens', '5-star lakeside dining'] },
        { day: 4, title: 'Ella Mountain Pass & Scenic Train', description: 'First-class observation train through misty tea mountains into Ella.', activities: ['Scenic train ride', 'Nine Arch Bridge photo tour', 'Luxury chalet check-in'] },
        { day: 5, title: 'Yala National Park VIP Safari', description: 'Private 4x4 Jeep safari tracking leopards, wild elephants and sloth bears.', activities: ['Luxury tented camp check-in', 'Private wildlife ranger safari', 'Bush dinner under stars'] },
        { day: 6, title: 'Galle Fort & Southern Riviera', description: 'Coastline drive to the UNESCO World Heritage Galle Dutch Fort.', activities: ['Fort lighthouse sunset stroll', 'Fine seafood dining', 'Heritage boutique hotel'] },
        { day: 7, title: 'Southern Coast & Departure', description: 'Relax on secluded golden sands before private luxury transfer to airport.', activities: ['Coastal brunch', 'Souvenir shopping', 'Airport VIP drop-off'] }
      ]
    }
  });

  console.log('Packages enriched with destination itineraries!');
  process.exit(0);
}

updatePackages().catch(err => {
  console.error(err);
  process.exit(1);
});

