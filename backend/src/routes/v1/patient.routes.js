const express = require('express');
const { 
  createPatient, 
  getAllPatients, 
  getPatientByUPID, 
  updatePatient 
} = require('../../controllers/patient.controller');

const router = express.Router();

router.post('/', createPatient);
router.get('/', getAllPatients);
router.get('/:upid', getPatientByUPID);
router.put('/:upid', updatePatient);

module.exports = router;
