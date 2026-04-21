const express = require("express");
const router = express.Router();

const { generateBill, getAllBills, payBill, addMiscCharge, printInvoice } = require("../../controllers/billing.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { roleMiddleware } = require("../../middlewares/role.middleware");

// 1. Static Routes First
router.get(
    "/",
    authMiddleware,
    roleMiddleware("Receptionist", "Admin"),
    getAllBills
);

router.post(
    "/pay",
    authMiddleware,
    roleMiddleware("Receptionist", "Admin"),
    payBill
);

router.post(
    "/misc",
    authMiddleware,
    roleMiddleware("Receptionist", "Admin"),
    addMiscCharge
);

// 2. Dynamic Routes Last
router.get(
    "/:upid/print",
    authMiddleware,
    roleMiddleware("Receptionist", "Admin"),
    printInvoice
);

router.get(
    "/:upid",
    authMiddleware,
    roleMiddleware("Receptionist", "Admin"),
    generateBill
);

module.exports = router;