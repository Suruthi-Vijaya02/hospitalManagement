const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
    {
        bedNumber: {
            type: String,
            required: true,
            unique: true,
        },
        wardType: {
            type: String,
            enum: ['General', 'Semi-Private', 'Private', 'ICU', 'Emergency'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Available', 'Occupied', 'Maintenance'],
            default: 'Available',
        },
        currentPatientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            default: null,
        },
        pricePerDay: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Bed', bedSchema);
