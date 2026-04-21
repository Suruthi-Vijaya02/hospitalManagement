const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        upid: {
            type: String,
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
        ipdCharges: {
            type: Number,
            default: 0,
        },
        otherCharges: [{
            description: String,
            amount: Number,
            date: { type: Date, default: Date.now }
        }],
        miscTotal: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        amountPaid: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Unpaid', 'Partial', 'Paid'],
            default: 'Unpaid',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);