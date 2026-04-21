const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
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
        bedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bed',
            required: true,
        },
        admissionDate: {
            type: Date,
            default: Date.now,
        },
        dischargeDate: {
            type: Date,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Admitted', 'Discharged'],
            default: 'Admitted',
        },
        admittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Admission', admissionSchema);
