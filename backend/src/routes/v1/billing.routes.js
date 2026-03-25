const express = require('express');
const router = express.Router();

const {
    createBill,
    getBillByPatient,
} = require('../../controllers/billing.controller');

// POST /billing
router.post('/', createBill);

// GET /billing/:upid
router.get('/:upid', getBillByPatient);

module.exports = router;