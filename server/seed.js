const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Destination = require('./models/Destination');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const destinations = [
  {
    name: 'Sigiriya',
    district: 'Matale',
    category: 'Cultural',
    description: 'Ancient rock fortress and palace ruin.',
    latitude: 7.9570,
    longitude: 80.7603,
    rating: 4.8,
    bestVisitTime: 'Morning'
  },
  {
    name: 'Ella',
    district: 'Badulla',
    category: 'Mountain',
    description: 'Small town surrounded by hills covered with cloud forests and tea plantations.',
    latitude: 6.8667,
    longitude: 81.0466,
    rating: 4.7,
    bestVisitTime: 'Morning'
  },
  {
    name: 'Kandy',
    district: 'Kandy',
    category: 'Cultural',
    description: 'Major city located in the Central Province of Sri Lanka.',
    latitude: 7.2906,
    longitude: 80.6337,
    rating: 4.5,
    bestVisitTime: 'Evening'
  },
  {
    name: 'Galle Fort',
    district: 'Galle',
    category: 'Cultural',
    description: 'Historical fort built by the Portuguese and Dutch.',
    latitude: 6.0270,
    longitude: 80.2168,
    rating: 4.6,
    bestVisitTime: 'Evening'
  },
  {
    name: 'Yala National Park',
    district: 'Hambantota',
    category: 'Wildlife',
    description: 'Huge area of forest, grassland and lagoons bordering the Indian Ocean.',
    latitude: 6.3683,
    longitude: 81.5204,
    rating: 4.5,
    bestVisitTime: 'Morning'
  },
  {
    name: 'Nuwara Eliya',
    district: 'Nuwara Eliya',
    category: 'Mountain',
    description: 'City in the tea country hills of central Sri Lanka.',
    latitude: 6.9497,
    longitude: 80.7828,
    rating: 4.6,
    bestVisitTime: 'Any'
  },
  {
    name: 'Mirissa',
    district: 'Matara',
    category: 'Beach',
    description: 'Small town on the south coast of Sri Lanka.',
    latitude: 5.9483,
    longitude: 80.4571,
    rating: 4.7,
    bestVisitTime: 'Afternoon'
  },
  {
    name: 'Arugam Bay',
    district: 'Ampara',
    category: 'Beach',
    description: 'Bay situated on the Indian Ocean in the dry zone of Sri Lanka.',
    latitude: 6.8436,
    longitude: 81.8285,
    rating: 4.8,
    bestVisitTime: 'Morning'
  },
  {
    name: 'Horton Plains',
    district: 'Nuwara Eliya',
    category: 'Forest',
    description: 'Protected area in the central highlands of Sri Lanka.',
    latitude: 6.8041,
    longitude: 80.8066,
    rating: 4.6,
    bestVisitTime: 'Morning'
  }
];

const importData = async () => {
  try {
    await Destination.deleteMany();
    await Destination.insertMany(destinations);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
