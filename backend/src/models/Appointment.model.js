const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
        patientName: {
            type: String,
            required: true,
        },
        doctorName: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
            enum: ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology', 'Gynecology', 'Oncology'],
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        appointmentTime: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
            default: 'Scheduled',
        },
        notes: {
            type: String,
            default: '',
        },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
