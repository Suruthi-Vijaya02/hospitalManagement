const LabTest = require('../models/LabTest.model');
const Patient = require('../models/Patient.model');

// Create lab test (accept UPID, convert to patientId)
exports.createLabTest = async (req, res) => {
  try {
    const { upid, testName } = req.body;
    
    if (!upid || !testName) {
      return res.status(400).json({ success: false, message: 'UPID and testName are required.' });
    }

    const patient = await Patient.findOne({ upid });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const labTest = new LabTest({
      patientId: patient._id,
      testName
    });

    await labTest.save();
    return res.status(201).json({ success: true, data: labTest });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Upload lab report (handle file upload using multer, store file path)
exports.uploadLabReport = async (req, res) => {
  try {
    const { testId } = req.body;

    if (!testId) {
      return res.status(400).json({ success: false, message: 'testId is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Report file is required.' });
    }

    const labTest = await LabTest.findById(testId);
    if (!labTest) {
      return res.status(404).json({ success: false, message: 'LabTest not found.' });
    }

    labTest.reportUrl = req.file.path;
    labTest.status = 'Completed';
    await labTest.save();

    return res.status(200).json({ success: true, data: labTest });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get lab reports by patient
exports.getLabReportsByPatient = async (req, res) => {
  try {
    const { upid } = req.params;

    const patient = await Patient.findOne({ upid });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const labTests = await LabTest.find({ patientId: patient._id });
    return res.status(200).json({ success: true, data: labTests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
