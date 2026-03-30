const mongoose = require("mongoose");

const pharmacyQueueSchema = new mongoose.Schema(
    {
        upid: {
            type: String,
            required: true
        },
        consultationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Consultation"
        },
        medicines: [
            {
                name: String,
                quantity: Number,
                status: {
                    type: String,
                    default: "Pending"
                },
                price: Number
            }
        ],
        status: {
            type: String,
            default: "Pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("PharmacyQueue", pharmacyQueueSchema);