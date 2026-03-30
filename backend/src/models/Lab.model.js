const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
  {
    upid: {
      type: String,
      required: true,
    },
    tests: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LabTest",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["Pending", "Completed"],
          default: "Pending",
        },
        reportUrl: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lab", labSchema);
