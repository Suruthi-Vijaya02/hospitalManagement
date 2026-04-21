const Appointment = require('../models/Appointment.model');
const Patient = require('../models/Patient.model');

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        const { upid, doctorName, department, appointmentDate, appointmentTime, reason } = req.body;

        if (!upid || !doctorName || !department || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Patient UPID, doctor, department, date and time are required.',
            });
        }

        // Look up patient by UPID
        const patient = await Patient.findOne({ upid });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: `No patient found with UPID: ${upid}`,
            });
        }

        const appointment = new Appointment({
            patientId: patient._id,
            upid: patient.upid,
            patientName: patient.name,
            doctorName,
            department,
            appointmentDate: new Date(appointmentDate),
            appointmentTime,
            reason: reason || '',
            bookedBy: req.user?._id,
        });

        await appointment.save();

        return res.status(201).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all appointments with optional filters
exports.getAppointments = async (req, res) => {
    try {
        const { date, status, department } = req.query;
        const filter = {};

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.appointmentDate = { $gte: start, $lte: end };
        }
        if (status) filter.status = status;
        if (department) filter.department = department;

        const appointments = await Appointment.find(filter)
            .sort({ appointmentDate: 1, appointmentTime: 1 })
            .lean();

        return res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get today's appointments
exports.getTodayAppointments = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            appointmentDate: { $gte: start, $lte: end },
        }).sort({ appointmentTime: 1 }).lean();

        return res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status, ...(notes !== undefined && { notes }) },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        return res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete / Cancel appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status: 'Cancelled' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        return res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get appointment stats for dashboard
exports.getAppointmentStats = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const todayTotal = await Appointment.countDocuments({ appointmentDate: { $gte: start, $lte: end } });
        const todayScheduled = await Appointment.countDocuments({ appointmentDate: { $gte: start, $lte: end }, status: 'Scheduled' });
        const todayCompleted = await Appointment.countDocuments({ appointmentDate: { $gte: start, $lte: end }, status: 'Completed' });

        return res.status(200).json({
            success: true,
            data: { todayTotal, todayScheduled, todayCompleted },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
