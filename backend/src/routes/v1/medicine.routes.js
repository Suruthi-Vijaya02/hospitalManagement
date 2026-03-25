const express = require('express');
const router = express.Router();

const {
    addMedicine,
    updateStock,
    getAllMedicines,
} = require('../../controllers/medicine.controllers');

// POST /medicine
router.post('/', addMedicine);

// PUT /medicine/:id
router.put('/:id', updateStock);

// GET /medicine
router.get('/', getAllMedicines);

module.exports = router;