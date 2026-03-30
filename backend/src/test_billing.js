const mongoose = require('mongoose');
const { generateBill } = require('./controllers/billing.controller');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testController() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Mock req and res
    const req = {
        params: { upid: 'PAT20260001' }
    };
    const res = {
        json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
        status: (code) => ({
            json: (data) => console.log(`Response ${code}:`, JSON.stringify(data, null, 2))
        })
    };

    try {
        await generateBill(req, res);
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
}
testController();
