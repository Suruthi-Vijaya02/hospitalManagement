const express = require("express");
const router = express.Router();

const {
  createPatient,
  getPatients,
  getPatientByUpid,
  updatePatient,
} = require("../../controllers/patient.controller");

const { authMiddleware } = require("../../middlewares/auth.middleware");
const { roleMiddleware } = require("../../middlewares/role.middleware");

// Receptionist and Admin
router.post("/", authMiddleware, roleMiddleware("Receptionist", "Admin"), createPatient);
router.put("/:upid", authMiddleware, roleMiddleware("Receptionist", "Admin"), updatePatient);

// All logged users can view
router.get("/", authMiddleware, getPatients);
router.get("/:upid", authMiddleware, getPatientByUpid);

module.exports = router;