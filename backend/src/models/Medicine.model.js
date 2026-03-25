const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
    {
        medicineName: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);