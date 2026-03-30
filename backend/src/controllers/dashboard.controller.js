const Patient = require("../models/Patient.model");
const Consultation = require("../models/Consultation.model");
const Lab = require("../models/Lab.model");
const Medicine = require("../models/Medicine.model");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    
    // Get today's start and end
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const consultationsToday = await Consultation.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const pendingLabReports = await Lab.countDocuments({
      status: { $ne: "Completed" }
    });

    const totalMedicines = await Medicine.countDocuments();
    const lowStockMedicines = await Medicine.countDocuments({
      stock: { $lt: 10 }
    });

    res.json({
      success: true,
      data: {
        totalPatients,
        consultationsToday,
        pendingLabReports,
        totalMedicines,
        lowStockMedicines
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
