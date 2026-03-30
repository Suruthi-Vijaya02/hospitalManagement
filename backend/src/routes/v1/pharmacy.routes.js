const express = require("express");
const router = express.Router();

const { getQueue, issueMedicine } = require("../../controllers/pharmacy.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { roleMiddleware } = require("../../middlewares/role.middleware");

// GET /api/v1/pharmacy/queue
router.get("/queue", authMiddleware, getQueue);

// PUT /api/v1/pharmacy/issue
router.put("/issue", authMiddleware, roleMiddleware("Pharmacist"), issueMedicine);

module.exports = router;