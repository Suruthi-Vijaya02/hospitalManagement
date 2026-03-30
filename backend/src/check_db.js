const mongoose = require('mongoose');
const Patient = require('./models/Patient.model');
const Bill = require('./models/Bill.model');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital');
    const upid = 'PAT20260001';
    const patient = await Patient.findOne({ upid });
    const bill = await Bill.findOne({ upid });
    console.log('Patient:', patient);
    console.log('Bill:', bill);
    process.exit();
}
check();
