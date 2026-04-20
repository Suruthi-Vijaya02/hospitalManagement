const express = require('express');
const router = express.Router();
const multer = require('multer');

const { 
  createLabTest, 
  uploadLabReport, 
  getLabReportsByPatient,
  getTests,
  createLab,
  updateStatus,
  getPatientLabs,
  createMasterTest,
  getLabQueue
} = require('../../controllers/lab.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/role.middleware');

// Simple local storage configuration for multer
const upload = multer({ dest: 'uploads/lab-reports/' });

// ------------ NEW LAB ENDPOINTS ------------
// POST /lab/tests -> create a new master test
router.post('/tests', authMiddleware, roleMiddleware('Lab', 'Admin'), createMasterTest);

// GET /lab/tests -> get master tests
router.get('/tests', authMiddleware, getTests);

// POST /lab -> create new lab entry (with testIds)
router.post('/', authMiddleware, roleMiddleware('Doctor', 'Receptionist', 'Lab', 'Admin'), createLab);

// PUT /lab/status -> update test status inside a lab entry
router.put('/status', authMiddleware, roleMiddleware('Lab', 'Admin'), updateStatus);

// GET /lab/queue -> get all pending lab requests
router.get('/queue', authMiddleware, roleMiddleware('Lab', 'Admin'), getLabQueue);

// GET /lab/:upid -> get lab requests/entries by patient upid
router.get('/:upid', authMiddleware, roleMiddleware('Lab', 'Admin'), getPatientLabs);

// ------------ OLD ENDPOINTS (kept for safety) ------------
// POST /lab/upload -> upload report
router.post('/upload', authMiddleware, roleMiddleware('Lab', 'Admin'), upload.single('report'), uploadLabReport);

// (Old) POST /lab/old -> if needed, but not mapped anymore since `/` is overridden.
// (Old) GET /lab/old/:upid -> replaced by getPatientLabs above.

module.exports = router;
