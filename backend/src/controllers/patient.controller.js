const Patient = require("../models/Patient.model");
const { generateUPID } = require("../services/uid.service");
const { sendWhatsApp } = require("../services/whatsapp.service");

// CREATE
exports.createPatient = async (req, res) => {
  try {
    const upid = await generateUPID();
    const patientData = { ...req.body, upid };
    const patient = await Patient.create(patientData);

    // 🔔 Automated Appointment Reminder
    if (patient.phone) {
      const dateStr = patient.appointmentDate 
        ? new Date(patient.appointmentDate).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
        : "N/A";
      
      const message = `*Appointment Confirmation*\n\nHello ${patient.name},\n\nYour appointment at HMS Impeccable has been confirmed.\n\n📅 *Date:* ${dateStr}\n🕒 *Time:* ${patient.appointmentTime || "N/A"}\n🆔 *UPID:* ${upid}\n\nPlease arrive 15 minutes early. See you soon!`;
      
      await sendWhatsApp(patient.phone, message);
    }

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