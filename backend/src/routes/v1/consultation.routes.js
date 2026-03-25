const express = require('express');
const router = express.Router();

const {
  createConsultation,
  getConsultationsByUpid,
} = require('../../controllers/consultation.controller');

// CREATE
router.post('/', createConsultation);

// GET BY UPID
router.get('/:upid', getConsultationsByUpid);

module.exports = router;