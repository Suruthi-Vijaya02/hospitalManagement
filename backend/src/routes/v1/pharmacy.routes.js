const express = require('express');
const router = express.Router();

const {
    createPharmacyEntry,
    getByPatient,
    markAsIssued,
} = require('../../controllers/pharmacy.controller');

// POST /pharmacy
router.post('/', createPharmacyEntry);

// GET /pharmacy/:upid
router.get('/:upid', getByPatient);

// PUT /pharmacy/:id/issue
router.put('/:id/issue', markAsIssued);

module.exports = router;