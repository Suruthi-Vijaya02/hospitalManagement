const Patient = require('../models/Patient.model');
const { generateUPID } = require('../services/uid.service');

// Create Patient
exports.createPatient = async (req, res) => {
  try {
    const { name, age, gender, phone } = req.body;
    
    // Generate UPID (e.g., PAT20260001)
    const upid = await generateUPID();

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      upid
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Patient by UPID
exports.getPatientByUPID = async (req, res) => {
  try {
    const patient = await Patient.findOne({ upid: req.params.upid });
    
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Patient
exports.updatePatient = async (req, res) => {
  try {
    // Only allow updating basic fields (ignore attempts to update UPID)
    const { name, age, gender, phone } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { upid: req.params.upid },
      { name, age, gender, phone },
      { new: true, runValidators: true } // Returns the updated document
    );

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
