const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: ["ADD_MISC_CHARGE", "PAY_BILL", "ADMIT_PATIENT", "DISCHARGE_PATIENT", "DELETE_BED"],
        },
        targetUpid: {
            type: String,
            required: true,
        },
        details: {
            type: Object,
            required: true,
        },
        ip: String,
        userAgent: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
