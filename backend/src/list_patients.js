const mongoose = require('mongoose');
const Patient = require('./models/Patient.model');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital');
    const patients = await Patient.find({}, 'upid name');
    console.log('Patients:', patients);
    process.exit();
}
check();
