const express = require('express');
const cors = require('cors');

const app = express();

// Global Middlewares
app.use(express.json()); // Parse JSON payloads
app.use(cors()); // Enable CORS

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
const errorHandler = require('./middlewares/error.middleware');



app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/medicine', medicineRoutes);
app.use(errorHandler);

module.exports = app;
