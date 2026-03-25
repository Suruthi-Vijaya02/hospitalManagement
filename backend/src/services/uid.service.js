const Patient = require('../models/Patient.model');

exports.generateUPID = async () => {
  const currentYear = new Date().getFullYear(); // e.g., 2026
  
  // Find the last patient created in this year to determine the next sequence
  const lastPatient = await Patient.findOne({
    upid: new RegExp(`^PAT${currentYear}`)
  }).sort({ createdAt: -1 });

  let sequenceNumber = 1;
  if (lastPatient && lastPatient.upid) {
    // Extract the last 4 digits and increment
    const lastSequence = parseInt(lastPatient.upid.slice(-4), 10);
    sequenceNumber = lastSequence + 1;
  }

  // Pad the sequence with zeros (e.g., 0001)
  const paddedSequence = sequenceNumber.toString().padStart(4, '0');
  
  return `PAT${currentYear}${paddedSequence}`;
};
