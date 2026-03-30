const mongoose = require('mongoose');
const Patient = require('./models/Patient.model');
const Bill = require('./models/Bill.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function check() {
    console.log('Using MONGO_URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    const upid = 'PAT20260001';
    const patients = await Patient.find({});
    console.log('Total Patients:', patients.length);
    if (patients.length > 0) {
        console.log('First Patient:', patients[0].upid, patients[0].name);
    }
    const bill = await Bill.findOne({ upid: patients[0]?.upid });
    console.log('Bill for first patient:', bill);
    process.exit();
}
check();
