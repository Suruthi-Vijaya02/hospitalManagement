const express = require('express');
const router = express.Router();
const { getBeds, createBed, updateBedStatus } = require('../../controllers/bed.controller');
const { admitPatient, dischargePatient, getActiveAdmissions } = require('../../controllers/admission.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/role.middleware');

// Bed Routes
router.get('/beds', authMiddleware, getBeds);
router.post('/beds', authMiddleware, roleMiddleware('Admin'), createBed);
router.patch('/beds/:id/status', authMiddleware, roleMiddleware('Admin', 'Receptionist', 'Doctor'), updateBedStatus);

// Admission Routes
router.post('/admissions/admit', authMiddleware, roleMiddleware('Admin', 'Receptionist', 'Doctor'), admitPatient);
router.post('/admissions/discharge', authMiddleware, roleMiddleware('Admin', 'Receptionist', 'Doctor'), dischargePatient);
router.get('/admissions/active', authMiddleware, getActiveAdmissions);

module.exports = router;
