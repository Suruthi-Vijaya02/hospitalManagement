const Consultation = require("../models/Consultation.model");
const PharmacyQueue = require("../models/PharmacyQueue.model");
const Lab = require("../models/Lab.model");
const Bill = require("../models/Bill.model");
const Patient = require("../models/Patient.model");

exports.generateBill = async (req, res) => {
    try {
        const { upid } = req.params;

        // 🔹 CONSULTATION (fixed fee)
        const consultations = await Consultation.find({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
        const consultationFee = consultations.length * 200; // adjust later

        // 🔹 LAB TESTS (Only Completed)
        const labs = await Lab.find({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });

        let labTotal = 0;
        labs.forEach((l) => {
            l.tests?.forEach((t) => {
                if (t.status === "Completed") {
                    labTotal += t.price || 0;
                }
            });
        });

        // 🔹 MEDICINES (ONLY ISSUED)
        const pharmacy = await PharmacyQueue.find({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });

        let medicineTotal = 0;

        pharmacy.forEach((p) => {
            p.medicines.forEach((m) => {
                if (m.status === "Issued") {
                    medicineTotal += (m.price || 10) * m.quantity; // fallback price
                }
            });
        });

        const total = consultationFee + labTotal + medicineTotal;

        const patient = await Patient.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: `No patient record found for UPID: ${upid}`,
            });
        }

        // 🔹 FETCH SAVED BILL STATUS
        let savedBill = await Bill.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
        if (!savedBill) {
            savedBill = await Bill.create({ 
                upid, 
                patientId: patient._id,
                totalAmount: total,
                consultationFee,
                labCharges: labTotal,
                medicineCharges: medicineTotal,
            });
        } else {
            // update total dynamically
            savedBill.totalAmount = total;
            savedBill.consultationFee = consultationFee;
            savedBill.labCharges = labTotal;
            savedBill.medicineCharges = medicineTotal;
            
            // Re-calc status dynamically in case totals grew
            if (total === 0) {
                savedBill.status = 'Paid';
            } else if (savedBill.amountPaid >= total) {
                savedBill.status = 'Paid';
            } else if (savedBill.amountPaid > 0) {
                savedBill.status = 'Partial';
            } else {
                savedBill.status = 'Unpaid';
            }
            
            await savedBill.save();
        }

        res.json({
            success: true,
            data: {
                consultationFee,
                labTotal,
                medicineTotal,
                total,
                status: savedBill?.status || "Unpaid",
                amountPaid: savedBill?.amountPaid || 0,
                consultations,
                labs,
                pharmacy,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate("patientId", "name")
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: bills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// POST /billing/pay
exports.payBill = async (req, res) => {
    try {
        const { upid, amount } = req.body;
        const paymentAmount = Number(amount);

        if (!upid || isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid UPID and payment amount are required' });
        }

        const bill = await Bill.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
        if (!bill) {
            return res.status(404).json({ success: false, message: 'No bill found for this patient' });
        }

        bill.amountPaid += paymentAmount;

        if (bill.amountPaid >= bill.totalAmount) {
            bill.status = 'Paid';
        } else if (bill.amountPaid > 0) {
            bill.status = 'Partial';
        }

        await bill.save();

        res.json({
            success: true,
            data: bill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};