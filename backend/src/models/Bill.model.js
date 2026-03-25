const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        consultationFee: {
            type: Number,
            default: 0,
        },
        labCharges: {
            type: Number,
            default: 0,
        },
        medicineCharges: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);