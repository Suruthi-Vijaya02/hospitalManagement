const Admission = require('../models/Admission.model');
const Bed = require('../models/Bed.model');
const Patient = require('../models/Patient.model');

// Admit Patient
exports.admitPatient = async (req, res) => {
    try {
        const { upid, bedId, reason } = req.body;

        const patient = await Patient.findOne({ upid });
        if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

        const bed = await Bed.findById(bedId);
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

        if (bed.status !== 'Available') {
            return res.status(400).json({ success: false, message: 'Bed is not available' });
        }

        const admission = new Admission({
            patientId: patient._id,
            upid: patient.upid,
            bedId: bed._id,
            reason,
            admittedBy: req.user.userId // From auth middleware
        });

        await admission.save();

        // Update Bed status
        bed.status = 'Occupied';
        bed.currentPatientId = patient._id;
        await bed.save();

        res.status(201).json({ success: true, data: admission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Discharge Patient
exports.dischargePatient = async (req, res) => {
    try {
        const { admissionId } = req.body;

        const admission = await Admission.findById(admissionId);
        if (!admission) return res.status(404).json({ success: false, message: 'Admission record not found' });

        if (admission.status === 'Discharged') {
            return res.status(400).json({ success: false, message: 'Patient already discharged' });
        }

        admission.status = 'Discharged';
        admission.dischargeDate = Date.now();
        await admission.save();

        // Free up the bed
        const bed = await Bed.findById(admission.bedId);
        if (bed) {
            bed.status = 'Available';
            bed.currentPatientId = null;
            await bed.save();
        }

        res.json({ success: true, message: 'Patient discharged and bed freed', data: admission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get current active admissions
exports.getActiveAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find({ status: 'Admitted' })
            .populate('patientId', 'name upid')
            .populate('bedId', 'bedNumber wardType');
        res.json({ success: true, data: admissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
