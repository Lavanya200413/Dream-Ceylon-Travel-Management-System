// Simple rule-based recommendation engine
const Destination = require('../models/Destination');

exports.recommendDestinations = async (touristProfile) => {
  try {
    const { interests, weatherPreference } = touristProfile;
    
    let query = {};
    
    // Example rule: match interests to destination category
    if (interests && interests.length > 0) {
      query.category = { $in: interests };
    }
    
    // Example rule: adjust query based on weather preference
    if (weatherPreference === 'Cold') {
      // Assuming Nuwara Eliya, Badulla districts are cold
      query.district = { $in: ['Nuwara Eliya', 'Badulla'] };
    } else if (weatherPreference === 'Hot') {
      query.district = { $nin: ['Nuwara Eliya', 'Badulla'] };
    }
    
    // Find destinations matching rules and sort by rating
    const recommendations = await Destination.find(query).sort({ rating: -1 }).limit(10);
    
    // Simple scoring logic: higher score for matching both interest and weather (done inherently by query)
    return recommendations.map(dest => ({
      destination: dest,
      matchScore: 90 // Placeholder score, can be dynamic based on more granular matching
    }));
  } catch (error) {
    console.error('Recommendation Engine Error:', error);
    throw error;
  }
};