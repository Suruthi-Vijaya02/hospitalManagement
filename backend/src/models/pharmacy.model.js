const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        medicines: [
            {
                type: String,
                required: true,
            },
        ],
        status: {
            type: String,
            enum: ['Pending', 'Issued'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Pharmacy', pharmacySchema);