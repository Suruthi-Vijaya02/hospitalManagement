const Bed = require('../models/Bed.model');

// Get all beds
exports.getBeds = async (req, res) => {
    try {
        const beds = await Bed.find().populate('currentPatientId', 'name upid');
        res.json({ success: true, data: beds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new bed (Admin/Receptionist)
exports.createBed = async (req, res) => {
    try {
        const { bedNumber, wardType, pricePerDay } = req.body;
        const bed = new Bed({ bedNumber, wardType, pricePerDay });
        await bed.save();
        res.status(201).json({ success: true, data: bed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update bed status (Maintenance/Available)
exports.updateBedStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const bed = await Bed.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
        res.json({ success: true, data: bed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
