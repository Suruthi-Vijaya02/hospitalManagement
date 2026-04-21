const express = require('express');
const cors = require('cors');
const loggerMiddleware = require('./middlewares/logger.middleware');

const app = express();

const path = require('path');

// Global Middlewares
app.use(express.json()); // Parse JSON payloads
app.use(cors()); // Enable CORS
app.use(loggerMiddleware); // Log all HTTP requests to file + MongoDB

// Serve uploaded lab reports statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('Hospital Management API is running...');
});

// Application Routes
const authRoutes = require('./routes/v1/auth.routes');
const patientRoutes = require('./routes/v1/patient.routes');
const consultationRoutes = require('./routes/v1/consultation.routes');
const labRoutes = require('./routes/v1/lab.routes');
const pharmacyRoutes = require('./routes/v1/pharmacy.routes');
const billingRoutes = require('./routes/v1/billing.routes');
const medicineRoutes = require('./routes/v1/medicine.routes');
const dashboardRoutes = require('./routes/v1/dashboard.routes');
const ipdRoutes = require('./routes/v1/ipd.routes');
const appointmentRoutes = require('./routes/v1/appointment.routes');
const errorHandler = require('./middlewares/error.middleware');



app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/medicine', medicineRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/ipd', ipdRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use(errorHandler);

module.exports = app;
