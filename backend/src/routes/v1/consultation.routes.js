const express = require("express");
const router = express.Router();

const {
  createConsultation,
  getConsultationsByUpid,
} = require("../../controllers/consultation.controller");

const { authMiddleware } = require("../../middlewares/auth.middleware");
const { roleMiddleware } = require("../../middlewares/role.middleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Doctor", "Admin"),
  createConsultation
);

router.get(
  "/:upid",
  authMiddleware,
  roleMiddleware("Doctor", "Admin"),
  getConsultationsByUpid
);

module.exports = router;