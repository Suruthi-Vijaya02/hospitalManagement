const Consultation = require("../models/Consultation.model");
const PharmacyQueue = require("../models/PharmacyQueue.model");
const Lab = require("../models/Lab.model");
const Bill = require("../models/Bill.model");
const Patient = require("../models/Patient.model");
const Admission = require("../models/Admission.model");
const AuditLog = require("../models/AuditLog.model");
const { generateInvoicePDF } = require("../services/invoice.service");

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
            p.medicines?.forEach((m) => {
                if (m.status === "Issued") {
                    medicineTotal += (m.price || 10) * m.quantity; // fallback price
                }
            });
        });

        // 🔹 IPD CHARGES (BED STAYS)
        const admissions = await Admission.find({ upid: { $regex: new RegExp(`^${upid}$`, "i") } }).populate('bedId');

        let ipdTotal = 0;
        admissions.forEach((a) => {
            if (a.bedId) {
                const admitDate = new Date(a.admitDate);
                const dischargeDate = a.dischargeDate ? new Date(a.dischargeDate) : new Date();

                // Calculate days (min 1 day)
                const diffTime = Math.abs(dischargeDate - admitDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

                ipdTotal += diffDays * (a.bedId.pricePerDay || 0);
            }
        });

        // 🔹 FETCH SAVED BILL STATUS
        let savedBill = await Bill.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });

        let miscTotal = 0;
        if (savedBill) {
            miscTotal = savedBill.otherCharges?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        }

        const total = consultationFee + labTotal + medicineTotal + ipdTotal + miscTotal;

        const patient = await Patient.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: `No patient record found for UPID: ${upid}`,
            });
        }

        if (!savedBill) {
            savedBill = await Bill.create({
                upid,
                patientId: patient._id,
                totalAmount: total,
                consultationFee,
                labCharges: labTotal,
                medicineCharges: medicineTotal,
                ipdCharges: ipdTotal,
                miscTotal: 0
            });
        } else {
            // update total dynamically
            savedBill.totalAmount = total;
            savedBill.consultationFee = consultationFee;
            savedBill.labCharges = labTotal;
            savedBill.medicineCharges = medicineTotal;
            savedBill.ipdCharges = ipdTotal;
            savedBill.miscTotal = miscTotal;

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
                upid: patient.upid,
                patientName: patient.name,
                consultationFee,
                labTotal,
                medicineTotal,
                ipdTotal,
                miscTotal,
                total,
                otherCharges: savedBill?.otherCharges || [],
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

        await AuditLog.create({
            user: req.user.id,
            action: "PAY_BILL",
            targetUpid: upid,
            details: { amountPaid: bill.amountPaid, status: bill.status },
            ip: req.ip,
            userAgent: req.get("user-agent")
        });

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

// POST /billing/misc
exports.addMiscCharge = async (req, res) => {
    console.log("AddMiscCharge hit with body:", req.body);
    try {
        const { upid, description, amount } = req.body;

        if (!upid || !description || !amount) {
            return res.status(400).json({ success: false, message: 'UPID, description and amount are required' });
        }

        let bill = await Bill.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });

        if (!bill) {
            const patient = await Patient.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
            if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

            bill = new Bill({
                upid: patient.upid,
                patientId: patient._id,
                totalAmount: Number(amount),
                otherCharges: [{ description, amount: Number(amount) }],
                miscTotal: Number(amount)
            });
        } else {
            bill.otherCharges.push({ description, amount: Number(amount) });
            bill.miscTotal += Number(amount);
            bill.totalAmount += Number(amount);

            // Update status
            if (bill.amountPaid >= bill.totalAmount) {
                bill.status = 'Paid';
            } else if (bill.amountPaid > 0) {
                bill.status = 'Partial';
            } else {
                bill.status = 'Unpaid';
            }
        }

        await bill.save();

        // Create Audit Log
        await AuditLog.create({
            user: req.user.id,
            action: "ADD_MISC_CHARGE",
            targetUpid: upid,
            details: { description, amount },
            ip: req.ip,
            userAgent: req.get("user-agent")
        });

        res.json({ success: true, data: bill });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.printInvoice = async (req, res) => {
    try {
        const { upid } = req.params;
        const patient = await Patient.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
        if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });

        // Get fresh bill data (using our existing logic)
        // For simplicity, we'll call generateBill logic or just find existing
        const bill = await Bill.findOne({ upid: { $regex: new RegExp(`^${upid}$`, "i") } });
        if (!bill) return res.status(404).json({ success: false, error: "No bill found for this patient" });

        const pdfBuffer = await generateInvoicePDF(bill, patient);

        res.setHeader("Content-Type", "application/json"); // Default
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=invoice_${upid}.pdf`,
            "Content-Length": pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate invoice PDF" });
    }
};