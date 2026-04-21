const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getTodayAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentStats,
} = require('../../controllers/appointment.controller');

const { authMiddleware } = require('../../middlewares/auth.middleware');

// All routes are protected
router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointments);
router.get('/today', authMiddleware, getTodayAppointments);
router.get('/stats', authMiddleware, getAppointmentStats);
router.put('/:id/status', authMiddleware, updateAppointmentStatus);
router.put('/:id/cancel', authMiddleware, cancelAppointment);

module.exports = router;
