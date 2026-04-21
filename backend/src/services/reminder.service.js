const cron = require('node-cron');
const Patient = require('../models/Patient.model');
const { sendWhatsApp } = require('./whatsapp.service');

/**
 * Returns start and end of a day that is `daysAhead` from today
 */
const getDayRange = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

/**
 * Send reminders for appointments happening `daysAhead` days from today
 */
const sendRemindersForDay = async (daysAhead) => {
    const label = daysAhead === 1 ? 'tomorrow' : `in ${daysAhead} days`;
    const { start, end } = getDayRange(daysAhead);

    try {
        // Find all patients with appointment in that day range
        const patients = await Patient.find({
            appointmentDate: { $gte: start, $lte: end },
            phone: { $exists: true, $ne: null },
        });

        console.log(`[Reminder] Found ${patients.length} appointment(s) ${label}`);

        for (const patient of patients) {
            try {
                const dateStr = new Date(patient.appointmentDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                const msg =
                    `*Appointment Reminder* ⏰\n\n` +
                    `Hello ${patient.name},\n\n` +
                    `This is a reminder that your appointment at *HMS Impeccable* is scheduled *${label}*.\n\n` +
                    `📅 *Date:* ${dateStr}\n` +
                    `🕒 *Time:* ${patient.appointmentTime || 'N/A'}\n` +
                    `🆔 *UPID:* ${patient.upid}\n\n` +
                    `Please arrive 15 minutes early. See you soon! 🏥`;

                const result = await sendWhatsApp(patient.phone, msg);

                if (result.success) {
                    console.log(`[Reminder] ✅ Sent ${label} reminder to ${patient.name} (${patient.phone})`);
                } else {
                    console.error(`[Reminder] ❌ Failed for ${patient.name}: ${result.error}`);
                }

            } catch (err) {
                console.error(`[Reminder] ❌ Error for patient ${patient.upid}:`, err.message);
            }
        }

    } catch (err) {
        console.error(`[Reminder] ❌ DB query failed for ${label}:`, err.message);
    }
};

/**
 * Start the cron scheduler
 * Runs every day at 9:00 AM
 */
const startReminderScheduler = () => {
    // Cron: '0 9 * * *' = every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('[Reminder] 🕘 Running daily appointment reminder job...');
        await sendRemindersForDay(1); // 1 day before
    }, {
        timezone: 'Asia/Kolkata' // ← IST timezone
    });

    console.log('[Reminder] ✅ Appointment reminder scheduler started (runs daily at 9:00 AM IST)');
};

module.exports = { startReminderScheduler };