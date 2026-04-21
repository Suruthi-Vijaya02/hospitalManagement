const cron = require('node-cron');
const Consultation = require('../models/Consultation.model');
const Patient = require('../models/Patient.model');
const { sendWhatsApp } = require('./whatsapp.service');

// Function to initialize the scheduler
const startReminderScheduler = () => {
    // Schedule a task to run every day at 9:00 AM
    // Format: minute hour day-of-month month day-of-week
    cron.schedule('0 9 * * *', async () => {
        console.log('[Reminder Service] Checking for upcoming follow-ups...');
        
        try {
            // Calculate the date 2 days from now (start and end of day)
            const targetDateStart = new Date();
            targetDateStart.setDate(targetDateStart.getDate() + 2);
            targetDateStart.setHours(0, 0, 0, 0);

            const targetDateEnd = new Date();
            targetDateEnd.setDate(targetDateEnd.getDate() + 2);
            targetDateEnd.setHours(23, 59, 59, 999);

            // Find consultations with nextFollowUpDate in that range
            const consultations = await Consultation.find({
                nextFollowUpDate: {
                    $gte: targetDateStart,
                    $lte: targetDateEnd
                }
            });

            console.log(`[Reminder Service] Found ${consultations.length} follow-ups scheduled for ${targetDateStart.toDateString()}`);

            for (const consultation of consultations) {
                const patient = await Patient.findOne({ upid: consultation.upid });
                
                if (patient && patient.phone) {
                    const message = `*Upcoming Follow-up Reminder*\n\nHello ${patient.name},\n\nThis is a friendly reminder from HMS Impeccable. Your follow-up visit is scheduled for *${targetDateStart.toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*.\n\nPlease arrive on time. We look forward to seeing you!`;
                    
                    try {
                        await sendWhatsApp(patient.phone, message);
                        console.log(`[Reminder Service] Sent reminder to ${patient.name} (${patient.phone})`);
                    } catch (err) {
                        console.error(`[Reminder Service] Failed to send to ${patient.phone}:`, err.message);
                    }
                }
            }
        } catch (error) {
            console.error('[Reminder Service] Error during task execution:', error.message);
        }
    });

    console.log('[Reminder Service] Scheduled: Daily follow-up check at 9:00 AM');
};

module.exports = { startReminderScheduler };