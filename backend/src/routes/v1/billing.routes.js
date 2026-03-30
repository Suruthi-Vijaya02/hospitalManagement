const express = require("express");
const router = express.Router();

const { generateBill, getAllBills } = require("../../controllers/billing.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { roleMiddleware } = require("../../middlewares/role.middleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("Receptionist"),
    getAllBills
);

router.get(
    "/:upid",
    authMiddleware,
    roleMiddleware("Receptionist"),
    generateBill
);

// POST /pay -> make a payment
router.post(
    "/pay",
    authMiddleware,
    roleMiddleware("Receptionist"),
    require("../../controllers/billing.controller").payBill
);

module.exports = router;