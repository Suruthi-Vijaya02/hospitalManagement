const PharmacyQueue = require("../models/PharmacyQueue.model");
const Medicine = require("../models/Medicine.model");

exports.getQueue = async (req, res) => {
    try {
        const data = await PharmacyQueue.find().sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.issueMedicine = async (req, res) => {
    try {
        const { queueId, index } = req.body;

        const queue = await PharmacyQueue.findById(queueId);
        if (!queue) {
            return res.status(404).json({ success: false, message: 'Queue not found' });
        }

        const med = queue.medicines[index];
        if (!med) {
            return res.status(404).json({ success: false, message: 'Medicine index not found' });
        }

        if (med.status === "Issued") {
            return res.status(400).json({ success: false, message: 'Medicine is already issued' });
        }

        // 🔥 REDUCE INVENTORY (FEFO Logic: First Expired First Out)
        // Find non-expired batches sorted by earliest expiry date
        const inventory = await Medicine.findOne({ 
            medicineName: med.name,
            stock: { $gte: med.quantity },
            expiryDate: { $gt: new Date() } // Exclude expired medicines
        }).sort({ expiryDate: 1 });

        if (inventory) {
            inventory.stock -= med.quantity;
            med.price = inventory.price || 0; // Lock in the current price from the specific batch
            await inventory.save();
        } else {
            // Check if it's just out of stock or all expired
            const expiredCheck = await Medicine.findOne({ 
                medicineName: med.name,
                expiryDate: { $lte: new Date() }
            });
            
            const errorMsg = expiredCheck 
                ? `Cannot issue "${med.name}": Available stock is expired.`
                : `Insufficient stock or medicine "${med.name}" not found in inventory.`;
                
            return res.status(400).json({ success: false, message: errorMsg });
        }

        med.status = "Issued";

        // check if all issued
        const allDone = queue.medicines.every((m) => m.status === "Issued");
        if (allDone) queue.status = "Completed";

        await queue.save();

        res.json({ success: true, data: queue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};