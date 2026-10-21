const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Package = require('./models/Package');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const packages = [
  {
    packageName: 'Basic',
    badge: 'Standard Transport',
    tagline: 'Standard transport arrangements for independent explorers',
    description: 'Designed specifically for tourists who only require standard transport facilities across Sri Lanka. Gives you complete freedom to arrange your own lodging, meals, and daily activities independently.',
    baseCharge: 85,
    features: {
      transport: 'Standard Air-Conditioned Vehicle with Licensed Chauffeur',
      accommodation: 'Not Included (Self-arranged by tourist)',
      meals: 'Not Included (Self-arranged by tourist)',
      tourGuide: 'Not Included (Driver only, no guiding services)'
    },
    includedFacilities: [
      'Standard air-conditioned vehicle (Sedan / Mini-Van / Van based on group size)',
      'Dedicated licensed professional chauffeur-driver for the entire itinerary',
      'All vehicle fuel, expressway toll fees, and commercial parking charges',
      'Airport pickup and drop-off transfers included',
      'Flexible daily driving hours (up to 8 hours / 200 km per day)',
      '24/7 on-road breakdown assistance and customer hotline'
    ],
    excludedFacilities: [
      'No accommodation or hotel stays included',
      'No food, meals, breakfast, or drinks included',
      'No tour guide or sightseeing commentary included',
      'No attraction, museum, or national park entrance tickets'
    ],
    allowGuideAddon: false,
    guideAddonPrice: 0,
    allowMealSelection: false,
    allowGuideSelection: false,
    mealOptions: [],
    guideOptions: [],
    pricingRules: {
      type: 'per_person_day',
      transportOnly: true
    }
  },
  {
    packageName: 'Standard',
    badge: 'Accommodation & Non-Food Facilities',
    tagline: 'Comfortable hotel stays and standard transport without mandatory meals',
    description: 'Combines comfortable hotel accommodations and reliable standard transport with essential non-food travel amenities. Food services are excluded by default so you can dine where you wish. Tour guides can be added as an optional additional service.',
    baseCharge: 180,
    features: {
      transport: 'Dedicated Standard Air-Conditioned Vehicle with Chauffeur',
      accommodation: 'Handpicked 3 to 4-Star Hotels and Eco-Lodge Stays',
      meals: 'Excluded by Default (Explore authentic local dining at your leisure)',
      tourGuide: 'Not Included by default (Optional add-on available)'
    },
    includedFacilities: [
      'Quality 3 to 4-star hotel accommodations with private ensuite bathrooms',
      'Standard air-conditioned private vehicle with experienced chauffeur',
      'All fuel, highway tolls, driver accommodation, and parking costs',
      'Hotel luggage handling, check-in coordination, and concierge support',
      'Applicable non-food travel facilities: vehicle Wi-Fi, bottled water & route assistance',
      '24/7 Dream Ceylon travel coordinator support throughout your stay'
    ],
    excludedFacilities: [
      'Food and meal services are NOT included by default (pay as you dine)',
      'A tour guide is NOT automatically included (available as an optional add-on)',
      'Laundry services, minibar expenses, and personal spending',
      'Optional activity entry fees and safari jeep rentals'
    ],
    allowGuideAddon: true,
    guideAddonPrice: 45, // $45/day optional tour guide service
    allowMealSelection: false,
    allowGuideSelection: false,
    mealOptions: [],
    guideOptions: [],
    pricingRules: {
      type: 'per_person_day',
      guideAddonRatePerDay: 45
    }
  },
  {
    packageName: 'Premium',
    badge: 'Complete Travel Experience',
    tagline: 'All-inclusive luxury with curated dining and specialist guides',
    description: 'The pinnacle of Sri Lankan hospitality. Enjoy luxury 5-star resort accommodations, executive transport, all gourmet meals tailored to your taste, and your choice of a dedicated specialist tour guide.',
    baseCharge: 350,
    features: {
      transport: 'Luxury Air-Conditioned SUV / Executive Van with VIP Chauffeur',
      accommodation: '5-Star Luxury Resorts, Heritage Villas & Tea Bungalows',
      meals: 'All Gourmet Meals Included (Choose your preferred culinary selection)',
      tourGuide: 'Dedicated Licensed Tour Guide Included (Choose your specialist)'
    },
    includedFacilities: [
      '5-Star luxury resort stays and boutique colonial heritage tea bungalows',
      'Luxury air-conditioned transport (SUV / VIP Van) with professional chauffeur',
      'Complete gourmet dining experience: Daily breakfast, lunch, high tea, and dinner',
      'Full selection of preferred food & meal options (Sri Lankan, Seafood, Halal, Vegan)',
      'Dedicated licensed National Tour Guide of your choice included',
      'All national park safaris, UNESCO heritage site tickets & cultural passes',
      'Airport VIP fast-track lounge access and priority luggage handling',
      'Complimentary Ayurvedic spa wellness session and traditional cultural show tickets'
    ],
    excludedFacilities: [
      'International airfares and visa processing fees',
      'Personal shopping and discretionary gratuities'
    ],
    allowGuideAddon: false, // Already included
    guideAddonPrice: 0,
    allowMealSelection: true,
    allowGuideSelection: true,
    mealOptions: [
      {
        name: 'Authentic Sri Lankan Culinary Experience',
        description: 'Traditional clay-pot village curries, hoppers, kottu, coconut sambols & local sweets',
        extraCostPerDay: 0
      },
      {
        name: 'Fresh Coastal Seafood Deluxe',
        description: 'Negombo lagoon crab, grilled jumbo tiger prawns, yellowfin tuna steaks & coastal catch',
        extraCostPerDay: 30
      },
      {
        name: 'International Continental & Western Cuisine',
        description: 'Fine-dining multi-course menus prepared by executive hotel chefs',
        extraCostPerDay: 15
      },
      {
        name: 'Vegetarian & Vegan Farm-to-Table Organic Feast',
        description: 'Organic seasonal vegetables, young jackfruit curries, tropical salads & herbal teas',
        extraCostPerDay: 0
      },
      {
        name: 'Halal-Certified Gourmet Selection',
        description: '100% Halal certified authentic Sri Lankan and international culinary spreads',
        extraCostPerDay: 10
      }
    ],
    guideOptions: [
      {
        name: 'Cultural & Heritage Historian Guide',
        specialty: 'Sigiriya, Anuradhapura, Polonnaruwa, Temple of the Tooth & UNESCO ancient history',
        languages: ['English', 'German', 'Sinhala'],
        dailyRate: 0
      },
      {
        name: 'Wildlife & Nature Safari Specialist',
        specialty: 'Yala leopard tracking, elephant corridors, birdwatching & Sinharaja rainforest ecology',
        languages: ['English', 'French', 'Sinhala'],
        dailyRate: 0
      },
      {
        name: 'Adventure, Trekking & Photography Guide',
        specialty: 'Ella Peak, Knuckles Mountain range trails, hidden waterfalls & best photo spots',
        languages: ['English', 'Spanish', 'Sinhala'],
        dailyRate: 0
      },
      {
        name: 'Executive Multilingual Chauffeur Guide',
        specialty: 'VIP protocol, high-end tea estates, gems & jewelry, luxury coastal hospitality',
        languages: ['English', 'Russian', 'Arabic', 'Sinhala'],
        dailyRate: 0
      }
    ],
    pricingRules: {
      type: 'all_inclusive_per_person_day',
      includesMeals: true,
      includesGuide: true
    }
  }
];

const seedPackages = async () => {
  try {
    await Package.deleteMany();
    await Package.insertMany(packages);
    console.log('Packages Seeded Successfully with Updated Rules!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedPackages();
