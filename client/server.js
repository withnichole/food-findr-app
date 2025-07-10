require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable or 3000

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Body parser for JSON requests

// --- MongoDB Connection ---
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Define Mongoose Schema and Model ---
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    cuisine: [{ type: String }],
    price: { type: String, required: true },
    neighborhood: { type: String, required: true },
    googleMapsUrl: { type: String, required: true }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// --- API Routes ---

// Route to get all restaurants (for initial population or debugging)
app.get('/api/restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
    } catch (err) {
        res.status(500).send('Error retrieving restaurants');
    }
});

// Route to handle recommendations based on user input
app.get('/api/recommendation', async (req, res) => {
    const { search, price } = req.query; // Get query parameters

    if (!search) {
        return res.status(400).json({ message: 'Please provide a search term (neighborhood or cuisine).' });
    }

    const searchTermLower = search.toLowerCase();
    const query = {
        $and: [
            {
                $or: [
                    { city: { $regex: searchTermLower, $options: 'i' } }, // Case-insensitive city search
                    { cuisine: { $regex: searchTermLower, $options: 'i' } }, // Case-insensitive cuisine search
                    { neighborhood: { $regex: searchTermLower, $options: 'i' } } // Case-insensitive neighborhood search
                ]
            }
        ]
    };

    if (price) {
        query.$and.push({ price: price });
    }

    try {
        const matchingRestaurants = await Restaurant.find(query);

        if (matchingRestaurants.length > 0) {
            const randomIndex = Math.floor(Math.random() * matchingRestaurants.length);
            const chosenRestaurant = matchingRestaurants[randomIndex];
            res.json(chosenRestaurant);
        } else {
            res.status(404).json({ message: 'No restaurants found matching your criteria. Try broadening your search!' });
        }
    } catch (err) {
        console.error('Error fetching recommendation:', err);
        res.status(500).send('Server error fetching recommendation.');
    }
});

// --- Serve Static Files (Your HTML Frontend) ---
// This will serve your index.html from the 'public' folder
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});