const Bill = require('../models/Bill.model');
const Patient = require('../models/Patient.model');

// Create Bill
exports.createBill = async (req, res) => {
    try {
        const { upid, consultationFee = 0, labCharges = 0, medicineCharges = 0 } = req.body;

        if (!upid) {
            return res.status(400).json({
                success: false,
                message: 'UPID is required',
            });
        }

        const patient = await Patient.findOne({ upid });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        const totalAmount =
            consultationFee + labCharges + medicineCharges;

        const bill = new Bill({
            patientId: patient._id,
            consultationFee,
            labCharges,
            medicineCharges,
            totalAmount,
        });

        await bill.save();

        return res.status(201).json({
            success: true,
            data: bill,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Bill by Patient
exports.getBillByPatient = async (req, res) => {
    try {
        const { upid } = req.params;

        const patient = await Patient.findOne({ upid });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        const bills = await Bill.find({ patientId: patient._id });

        return res.status(200).json({
            success: true,
            data: bills,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};