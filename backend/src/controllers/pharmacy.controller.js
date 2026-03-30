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

        // 🔥 REDUCE INVENTORY & ATTACH PRICE
        const inventory = await Medicine.findOne({ medicineName: med.name });
        if (inventory) {
            if (inventory.stock < med.quantity) {
                 return res.status(400).json({ success: false, message: 'Not enough stock in inventory!' });
            }
            inventory.stock -= med.quantity;
            med.price = inventory.price || 0; // Lock in the current price
            await inventory.save();
        } else {
            return res.status(404).json({ success: false, message: `Medicine "${med.name}" not found in inventory` });
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