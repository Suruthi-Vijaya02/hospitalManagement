const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Patient = require('./models/Patient.model');
const Consultation = require('./models/Consultation.model');
const PharmacyQueue = require('./models/PharmacyQueue.model');
const Lab = require('./models/Lab.model');
const Medicine = require('./models/Medicine.model');
const Bill = require('./models/Bill.model');
const { generateBill } = require('./controllers/billing.controller');
const { issueMedicine } = require('./controllers/pharmacy.controller');

async function verifyFixes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testUpid = 'TESTPAT' + Date.now();
        const lowerUpid = testUpid.toLowerCase();

        // 1. Create Patient
        const patient = await Patient.create({
            upid: testUpid,
            name: 'Test Patient',
            age: 30,
            gender: 'Male',
            phone: '1234567890'
        });
        console.log('Created Patient:', testUpid);

        // 2. Create Medicine in Inventory
        const medName = 'Paracetamol';
        await Medicine.deleteMany({ medicineName: medName });
        await Medicine.create({
            medicineName: medName,
            stock: 100,
            price: 5,
            expiryDate: new Date('2026-12-31')
        });
        console.log('Created Medicine:', medName);

        // 3. Create Consultation with Medicine and Lab
        const consultation = await Consultation.create({
            upid: testUpid,
            diagnosis: 'Fever',
            doctor: 'Dr. Smith'
        });

        // 4. Create Pharmacy Queue (with lowercase UPID to test case-insensitivity)
        const queue = await PharmacyQueue.create({
            upid: lowerUpid, 
            consultationId: consultation._id,
            medicines: [{ name: medName, quantity: 2, status: 'Pending', price: 0 }]
        });
        console.log('Created Pharmacy Queue (LowerUPID)');

        // 5. Create Lab Entry (with mixed case UPID)
        const lab = await Lab.create({
            upid: testUpid.substring(0, 4) + testUpid.substring(4).toLowerCase(),
            tests: [
                { testId: new mongoose.Types.ObjectId(), name: 'Blood Test', price: 500, status: 'Pending' },
                { testId: new mongoose.Types.ObjectId(), name: 'X-Ray', price: 1000, status: 'Completed' }
            ]
        });
        console.log('Created Lab Entry');

        // 6. Test Billing Generation (should only show 1 consultation and 1 completed lab, 0 issued medicine)
        console.log('\n--- FIRST BILLING (Before Issue) ---');
        const req1 = { params: { upid: testUpid } };
        const res1 = {
            json: (data) => {
                console.log('Consultation Fee:', data.data.consultationFee); // 200
                console.log('Lab Total:', data.data.labTotal); // 1000 (only completed)
                console.log('Medicine Total:', data.data.medicineTotal); // 0
            }
        };
        await generateBill(req1, res1);

        // 7. Issue Medicine
        console.log('\nIssuing Medicine...');
        const req2 = { body: { queueId: queue._id, index: 0 } };
        const res2 = { json: (data) => console.log('Medicine Issued successfully') };
        await issueMedicine(req2, res2);

        // 8. Test Billing Generation Again (should now include medicine)
        console.log('\n--- SECOND BILLING (After Issue) ---');
        const res3 = {
            json: (data) => {
                console.log('Medicine Total:', data.data.medicineTotal); // 10 (2 * 5)
                console.log('Total:', data.data.total); // 200 + 1000 + 10 = 1210
            }
        };
        await generateBill(req1, res3);

        console.log('\nVerification Complete!');
    } catch (err) {
        console.error('Error during verification:', err);
    } finally {
        // Cleanup
        await Patient.deleteMany({ upid: new RegExp('^TESTPAT') });
        await Consultation.deleteMany({ upid: new RegExp('^TESTPAT') });
        await PharmacyQueue.deleteMany({ upid: new RegExp('^TESTPAT') });
        await Lab.deleteMany({ upid: new RegExp('^TESTPAT') });
        // Don't delete medicine to keep it for manual testing if needed
        process.exit();
    }
}

verifyFixes();
