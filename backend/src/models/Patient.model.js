const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    upid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: Number,
    gender: String,
    phone: String,
    address: String,

    // 🔥 REALISTIC ADDITION
    appointmentDate: Date,
    appointmentTime: String,

    // optional
    bloodGroup: String,
    symptoms: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);