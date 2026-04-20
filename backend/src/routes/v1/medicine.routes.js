const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/role.middleware');

const {
    addMedicine,
    updateStock,
    getAllMedicines,
} = require('../../controllers/medicine.controllers');

// POST /medicine
router.post('/', authMiddleware, roleMiddleware('Pharmacist', 'Admin'), addMedicine);

// PUT /medicine/:id
router.put('/:id', authMiddleware, roleMiddleware('Pharmacist', 'Admin'), updateStock);

// GET /medicine
router.get('/', authMiddleware, getAllMedicines);

module.exports = router;