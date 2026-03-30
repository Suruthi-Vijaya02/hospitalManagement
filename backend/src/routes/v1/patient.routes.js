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

// Receptionist only
router.post("/", authMiddleware, roleMiddleware("Receptionist"), createPatient);
router.put("/:upid", authMiddleware, roleMiddleware("Receptionist"), updatePatient);

// All logged users can view
router.get("/", authMiddleware, getPatients);
router.get("/:upid", authMiddleware, getPatientByUpid);

module.exports = router;