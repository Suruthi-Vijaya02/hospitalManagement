const Consultation = require('../models/Consultation.model');
const PharmacyQueue = require("../models/PharmacyQueue.model");

// CREATE CONSULTATION
exports.createConsultation = async (req, res) => {
  try {
    const { upid: rawUpid, diagnosis, medicines, doctor, prescription } = req.body;
    const upid = rawUpid ? rawUpid.toUpperCase() : rawUpid;

    const consultation = await Consultation.create({
      upid,
      diagnosis,
      medicines,
      doctor,
      prescription,
      doctorId: req.user ? req.user.id : undefined,
    });

    if (medicines && medicines.length > 0) {
      // 🔥 AUTO CREATE PHARMACY QUEUE
      await PharmacyQueue.create({
        consultationId: consultation._id,
        upid,
        medicines: medicines.map((m) => ({
          name: m.name,
          quantity: m.quantity,
          status: "Pending",
          price: 0 // Optional fallback price
        })),
        status: "Pending"
      });
    }

    if (req.body.labTests && req.body.labTests.length > 0) {
      // 🔥 AUTO CREATE LAB ENTRY
      const Lab = require('../models/Lab.model');
      await Lab.create({
        upid,
        tests: req.body.labTests.map(t => ({
          testId: t._id,
          name: t.name,
          price: t.price,
          status: "Pending",
          reportUrl: null
        }))
      });
    }

    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET CONSULTATIONS BY UPID
exports.getConsultationsByUpid = async (req, res) => {
  try {
    const { upid } = req.params;

    const consultations = await Consultation.find({ upid: { $regex: new RegExp(`^${upid}$`, "i") } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};