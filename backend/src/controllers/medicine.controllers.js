const Medicine = require('../models/Medicine.model');

// Add medicine
exports.addMedicine = async (req, res) => {
    try {
        const { medicineName, stock, expiryDate, price } = req.body;

        if (!medicineName) {
            return res.status(400).json({
                success: false,
                message: 'medicineName is required',
            });
        }
        if (!expiryDate) {
            return res.status(400).json({
                success: false,
                message: ' expiryDate is required',
            });
        }

        const medicine = new Medicine({
            medicineName,
            stock,
            expiryDate,
            price,
        });

        await medicine.save();

        return res.status(201).json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update stock
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        const medicine = await Medicine.findById(id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found',
            });
        }

        medicine.stock = stock;
        await medicine.save();

        return res.status(200).json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all medicines
exports.getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find();

        return res.status(200).json({
            success: true,
            data: medicines,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};