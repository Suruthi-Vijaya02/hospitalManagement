const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
    {
        upid: {
            type: String,
            required: true,
        },
        doctor: {
            type: String,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        diagnosis: {
            type: String,
        },
        prescription: {
            type: String,
        },
        medicines: [
            {
                name: String,
                quantity: Number
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);