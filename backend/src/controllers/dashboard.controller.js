const Patient = require("../models/Patient.model");
const Consultation = require("../models/Consultation.model");
const Lab = require("../models/Lab.model");
const Medicine = require("../models/Medicine.model");
const Appointment = require("../models/Appointment.model");

exports.getDashboardStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      consultationsToday,
      pendingLabReports,
      totalMedicines,
      lowStockMedicines,
      appointmentsToday,
      appointmentsScheduled,
      lowStockItems,
    ] = await Promise.all([
      Patient.countDocuments(),
      Consultation.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Lab.countDocuments({ status: { $ne: "Completed" } }),
      Medicine.countDocuments(),
      Medicine.countDocuments({ $expr: { $lte: ["$stock", "$reorderLevel"] } }),
      Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
      Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay }, status: "Scheduled" }),
      Medicine.find({ $expr: { $lte: ["$stock", "$reorderLevel"] } })
        .select("medicineName stock reorderLevel")
        .limit(10)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        consultationsToday,
        pendingLabReports,
        totalMedicines,
        lowStockMedicines,
        appointmentsToday,
        appointmentsScheduled,
        lowStockItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
