const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
    {
        medicineName: {
            type: String,
            required: true,
        },
        batchNumber: {
            type: String,
            required: true,
        },
        manufacturer: {
            type: String,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        reorderLevel: {
            type: Number,
            default: 10,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);