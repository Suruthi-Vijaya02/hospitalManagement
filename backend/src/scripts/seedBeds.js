const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const Bed = require('../models/Bed.model');

const beds = [
    { bedNumber: "G-101", wardType: "General", pricePerDay: 500 },
    { bedNumber: "G-102", wardType: "General", pricePerDay: 500 },
    { bedNumber: "G-103", wardType: "General", pricePerDay: 500 },
    { bedNumber: "G-104", wardType: "General", pricePerDay: 500 },
    { bedNumber: "S-201", wardType: "Semi-Private", pricePerDay: 1200 },
    { bedNumber: "S-202", wardType: "Semi-Private", pricePerDay: 1200 },
    { bedNumber: "P-301", wardType: "Private", pricePerDay: 2500 },
    { bedNumber: "P-302", wardType: "Private", pricePerDay: 2500 },
    { bedNumber: "ICU-1", wardType: "ICU", pricePerDay: 5000 },
    { bedNumber: "ICU-2", wardType: "ICU", pricePerDay: 5000 },
    { bedNumber: "EMR-1", wardType: "Emergency", pricePerDay: 1000 },
    { bedNumber: "EMR-2", wardType: "Emergency", pricePerDay: 1000 },
];

const seedBeds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // Clear existing beds to avoid duplicates during testing
        await Bed.deleteMany({});
        console.log("Existing beds cleared.");

        await Bed.insertMany(beds);
        console.log("12 Hospital Beds initialized successfully!");
        
        process.exit();
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seedBeds();
