const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createLabTest, uploadLabReport, getLabReportsByPatient } = require('../../controllers/lab.controller');

// Simple local storage configuration for multer
const upload = multer({ dest: 'uploads/lab-reports/' });

// POST /lab -> create test
router.post('/', createLabTest);

// POST /lab/upload -> upload report
router.post('/upload', upload.single('report'), uploadLabReport);

// GET /lab/:upid -> get reports
router.get('/:upid', getLabReportsByPatient);

module.exports = router;
