const LabTest = require('../models/LabTest.model');
const Patient = require('../models/Patient.model');
const Lab = require('../models/Lab.model');
const { sendWhatsApp } = require('../services/whatsapp.service');
const path = require('path');

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
    const { labId, testId } = req.body;

    if (!labId || !testId) {
      return res.status(400).json({ success: false, message: 'labId and testId are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Report file is required.' });
    }

    const labEntry = await Lab.findById(labId);
    if (!labEntry) {
      return res.status(404).json({ success: false, message: 'Lab entry not found.' });
    }

    const testToUpdate = labEntry.tests.id(testId);
    if (!testToUpdate) {
      return res.status(404).json({ success: false, message: 'Test not found within this lab entry.' });
    }

    // Replace backslashes since Windows multer path saves with backslashes
    testToUpdate.reportUrl = req.file.path.replace(/\\/g, '/');
    testToUpdate.status = 'Completed';
    await labEntry.save();
    // 🔔 WhatsApp Notification — Lab Report Ready
    try {
      const patient = await Patient.findOne({ upid: labEntry.upid });
      if (patient && patient.phone) {

        // ✅ Build public URL pointing to the uploaded file
        const reportFullUrl = `${process.env.BASE_URL}/uploads/lab-reports/${path.basename(testToUpdate.reportUrl)}`;

        const msg = `Hello ${patient.name}, your lab report for *${testToUpdate.name}* is ready. Please find your report attached below.`;

        // ✅ Pass mediaUrl as 3rd argument — file will be attached in WhatsApp
        await sendWhatsApp(patient.phone, msg, reportFullUrl);
      }
    } catch (notifyErr) {
      console.error('[WhatsApp] Lab notify failed:', notifyErr.message);
    }

    return res.status(200).json({ success: true, data: labEntry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new Master Lab Test (Pre-logged by Admin/Lab)
exports.createMasterTest = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Name and valid numeric price are required.' });
    }

    const test = new LabTest({ name, price: Number(price) });
    await test.save();

    return res.status(201).json({ success: true, data: test });
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

// ----------------------------------------------------
// NEW ADDED CONTROLLER FUNCTIONS BELOW
// ----------------------------------------------------

// Fetch all the master lab tests
exports.getTests = async (req, res) => {
  try {
    const tests = await LabTest.find();
    return res.status(200).json({ success: true, data: tests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new lab entry for a patient with selected test IDs
exports.createLab = async (req, res) => {
  try {
    const { upid, testIds } = req.body;

    if (!upid || !testIds || !Array.isArray(testIds)) {
      return res.status(400).json({
        success: false,
        message: 'UPID and an array of testIds are required.'
      });
    }

    const selectedTests = await LabTest.find({ _id: { $in: testIds } });

    if (selectedTests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid tests found from the provided testIds.'
      });
    }

    const testEntries = selectedTests.map(t => ({
      testId: t._id,
      name: t.name,
      price: t.price,
      status: 'Pending',
      reportUrl: null
    }));

    const labEntry = new Lab({
      upid,
      tests: testEntries
    });

    await labEntry.save();

    // 🔔 WhatsApp Notification (Optional)
    try {
      const patient = await Patient.findOne({ upid: labEntry.upid });
      if (patient && patient.phone) {
        const msg = `Hello ${patient.name}, your lab order has been created. Status: Pending.`;
        await sendWhatsApp(patient.phone, msg);
      }
    } catch (err) {
      console.error('[WhatsApp] Lab notify failed:', err.message);
    }

    return res.status(201).json({ success: true, data: labEntry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update status and/or reportUrl of a specific test inside a lab entry
exports.updateStatus = async (req, res) => {
  try {
    const { labId, testId, status, reportUrl } = req.body;

    if (!labId || !testId || !status) {
      return res.status(400).json({
        success: false,
        message: 'labId, testId, and status are required to update.'
      });
    }

    const labEntry = await Lab.findById(labId);
    if (!labEntry) {
      return res.status(404).json({ success: false, message: 'Lab entry not found.' });
    }

    // Find the specific test inside the tests array
    const testToUpdate = labEntry.tests.id(testId);
    if (!testToUpdate) {
      return res.status(404).json({ success: false, message: 'Test not found within this lab entry.' });
    }

    // Update the fields
    if (['Pending', 'Completed'].includes(status)) {
      testToUpdate.status = status;
    }

    if (reportUrl !== undefined) {
      testToUpdate.reportUrl = reportUrl;
    }

    await labEntry.save();

    return res.status(200).json({ success: true, data: labEntry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch Lab entries for a specific patient
exports.getPatientLabs = async (req, res) => {
  try {
    const { upid } = req.params;
    const labs = await Lab.find({ upid }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: labs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Fetch all Lab entries that have at least one 'Pending' test
exports.getLabQueue = async (req, res) => {
  try {
    const labs = await Lab.find({ "tests.status": "Pending" }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: labs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
