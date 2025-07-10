require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected for data import!'))
    .catch(err => console.error('MongoDB connection error:', err));

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    cuisine: [{ type: String }],
    price: { type: String, required: true },
    neighborhood: { type: String, required: true },
    googleMapsUrl: { type: String, required: true }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

const restaurantsData = [
    // Paste your entire restaurants array from your HTML here
    // Example:
    { name: "Mama's on the Half Shell", city: "Baltimore", cuisine: ["Seafood", "American"], price: "$$", neighborhood: "Fells Point", googleMapsUrl: "https://www.google.com/maps?q=Mama's+on+the+Half+Shell+Baltimore" },
    { name: "Mayuree Thai Tavern ", city: "Baltimore", cuisine: ["Thai"], price: "$$", neighborhood: "Mount Vernon", googleMapsUrl: "https://www.google.com/maps?q=Mayuree+Thai+Tavern+Baltimore" },
    // ... (rest of your restaurant objects)
     { name: "ZAATAR Mediterranean Cuisine", city: "Baltimore", cuisine: ["Mediterranean"], price: "$", neighborhood: "Federal Hill", googleMapsUrl: "https://www.google.com/maps?q=ZAATAR+Mediterranean+Cuisine+Baltimore" },
];

async function importRestaurants() {
    try {
        await Restaurant.deleteMany({}); // Clear existing data (use with caution!)
        await Restaurant.insertMany(restaurantsData);
        console.log('Restaurants data imported successfully!');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error importing data:', err);
        mongoose.connection.close();
    }
}

importRestaurants();