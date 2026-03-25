const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: { type: String, required: true },
  upid: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
