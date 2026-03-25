const Pharmacy = require('../models/pharmacy.model');
const Patient = require('../models/Patient.model');

// Create pharmacy entry (using UPID)
exports.createPharmacyEntry = async (req, res) => {
    try {
        const { upid, medicines } = req.body;

        if (!upid || !medicines || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'UPID and medicines are required',
            });
        }

        const patient = await Patient.findOne({ upid });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        const entry = new Pharmacy({
            patientId: patient._id,
            medicines,
        });

        await entry.save();

        return res.status(201).json({
            success: true,
            data: entry,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get pharmacy entries by patient
exports.getByPatient = async (req, res) => {
    try {
        const { upid } = req.params;

        const patient = await Patient.findOne({ upid });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        const entries = await Pharmacy.find({ patientId: patient._id });

        return res.status(200).json({
            success: true,
            data: entries,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Mark as issued
exports.markAsIssued = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await Pharmacy.findById(id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found',
            });
        }

        entry.status = 'Issued';
        await entry.save();

        return res.status(200).json({
            success: true,
            data: entry,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};