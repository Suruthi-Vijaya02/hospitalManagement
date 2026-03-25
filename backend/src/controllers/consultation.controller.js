const Consultation = require('../models/Consultation.model');

// CREATE CONSULTATION
exports.createConsultation = async (req, res) => {
  try {
    const { upid, doctor, diagnosis, prescription } = req.body;

    const consultation = await Consultation.create({
      upid,
      doctor,
      diagnosis,
      prescription,
    });

    res.status(201).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET CONSULTATIONS BY UPID
exports.getConsultationsByUpid = async (req, res) => {
  try {
    const { upid } = req.params;

    const consultations = await Consultation.find({ upid })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};