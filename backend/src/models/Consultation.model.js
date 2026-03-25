const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
    {
        upid: {
            type: String,
            required: true,
        },
        doctor: {
            type: String,
            required: true,
        },
        diagnosis: {
            type: String,
        },
        prescription: {
            type: String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);