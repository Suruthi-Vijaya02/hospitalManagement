const Patient = require("../models/Patient.model");
const { generateUPID } = require("../services/uid.service");

// CREATE
exports.createPatient = async (req, res) => {
  try {
    const upid = await generateUPID();
    const patientData = { ...req.body, upid };
    const patient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY UPID
exports.getPatientByUpid = async (req, res) => {
  try {
    const patient = await Patient.findOne({ upid: req.params.upid });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { upid: req.params.upid },
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};